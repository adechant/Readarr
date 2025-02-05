using System;
using System.IO;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.EnsureThat;
using NzbDrone.Core.Books;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MediaFiles.BookImport;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Organizer;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.MediaFiles
{
    public interface IMoveBookFiles
    {
        BookFile MoveBookFile(BookFile bookFile, Author author);
        BookFile MoveBookFile(BookFile bookFile, LocalBook localBook);
        BookFile CopyBookFile(BookFile bookFile, LocalBook localBook);
    }

    public class BookFileMovingService : IMoveBookFiles
    {
        private readonly IEditionService _editionService;
        private readonly IUpdateBookFileService _updateBookFileService;
        private readonly IBuildFileNames _buildFileNames;
        private readonly IDiskTransferService _diskTransferService;
        private readonly IDiskProvider _diskProvider;
        private readonly IRootFolderWatchingService _rootFolderWatchingService;
        private readonly IMediaFileAttributeService _mediaFileAttributeService;
        private readonly IEventAggregator _eventAggregator;
        private readonly IConfigService _configService;
        private readonly Logger _logger;

        public BookFileMovingService(IEditionService editionService,
                                      IUpdateBookFileService updateBookFileService,
                                      IBuildFileNames buildFileNames,
                                      IDiskTransferService diskTransferService,
                                      IDiskProvider diskProvider,
                                      IRootFolderWatchingService rootFolderWatchingService,
                                      IMediaFileAttributeService mediaFileAttributeService,
                                      IEventAggregator eventAggregator,
                                      IConfigService configService,
                                      Logger logger)
        {
            _editionService = editionService;
            _updateBookFileService = updateBookFileService;
            _buildFileNames = buildFileNames;
            _diskTransferService = diskTransferService;
            _diskProvider = diskProvider;
            _rootFolderWatchingService = rootFolderWatchingService;
            _mediaFileAttributeService = mediaFileAttributeService;
            _eventAggregator = eventAggregator;
            _configService = configService;
            _logger = logger;
        }

        public BookFile MoveBookFile(BookFile bookFile, Author author)
        {
            var edition = _editionService.GetEdition(bookFile.EditionId);
            var newFileName = _buildFileNames.BuildBookFileName(author, edition, bookFile);
            var filePath = _buildFileNames.BuildBookFilePath(author, edition, newFileName, Path.GetExtension(bookFile.Path));

            EnsureBookFolder(bookFile, author, edition.Book.Value, filePath);

            _logger.Debug("Renaming book file: {0} to {1}", bookFile, filePath);

            return TransferFile(bookFile, author, bookFile.Edition.Value.Book.Value, filePath, TransferMode.Move);
        }

        public BookFile MoveBookFile(BookFile bookFile, LocalBook localBook)
        {
            var newFileName = _buildFileNames.BuildBookFileName(localBook.Author, localBook.Edition, bookFile);
            var filePath = _buildFileNames.BuildBookFilePath(localBook.Author, localBook.Edition, newFileName, Path.GetExtension(localBook.Path));

            //Ensure the filePath length is less than 260. Otherwise truncate the file name
            if (filePath.Length > 260)
            {
                var truncateLength = filePath.Length - newFileName.Length;
                newFileName = newFileName.Substring(0, truncateLength);
                filePath = _buildFileNames.BuildBookFilePath(localBook.Author, localBook.Edition, newFileName, Path.GetExtension(localBook.Path));
            }

            EnsureTrackFolder(bookFile, localBook, filePath);

            _logger.Debug("Moving book file: {0} to {1}", bookFile.Path, filePath);

            return TransferFile(bookFile, localBook.Author, localBook.Book, filePath, TransferMode.Move);
        }

        public BookFile CopyBookFile(BookFile bookFile, LocalBook localBook)
        {
            var newFileName = _buildFileNames.BuildBookFileName(localBook.Author, localBook.Edition, bookFile);
            var filePath = _buildFileNames.BuildBookFilePath(localBook.Author, localBook.Edition, newFileName, Path.GetExtension(localBook.Path));

            EnsureTrackFolder(bookFile, localBook, filePath);

            if (_configService.CopyUsingHardlinks)
            {
                _logger.Debug("Hardlinking book file: {0} to {1}", bookFile.Path, filePath);
                return TransferFile(bookFile, localBook.Author, localBook.Book, filePath, TransferMode.HardLinkOrCopy);
            }

            _logger.Debug("Copying book file: {0} to {1}", bookFile.Path, filePath);
            return TransferFile(bookFile, localBook.Author, localBook.Book, filePath, TransferMode.Copy);
        }

        private BookFile TransferFile(BookFile bookFile, Author author, Book book, string destinationFilePath, TransferMode mode)
        {
            Ensure.That(bookFile, () => bookFile).IsNotNull();
            Ensure.That(author, () => author).IsNotNull();
            Ensure.That(destinationFilePath, () => destinationFilePath).IsValidPath(PathValidationType.CurrentOs);

            var bookFilePath = bookFile.Path;

            if (!_diskProvider.FileExists(bookFilePath))
            {
                throw new FileNotFoundException("Book file path does not exist", bookFilePath);
            }

            if (bookFilePath == destinationFilePath)
            {
                throw new SameFilenameException("File not moved, source and destination are the same", bookFilePath);
            }

            _rootFolderWatchingService.ReportFileSystemChangeBeginning(bookFilePath, destinationFilePath);
            _diskTransferService.TransferFile(bookFilePath, destinationFilePath, mode);

            bookFile.Path = destinationFilePath;

            _updateBookFileService.ChangeFileDateForFile(bookFile, author, book);

            try
            {
                _mediaFileAttributeService.SetFolderLastWriteTime(author.Path, bookFile.DateAdded);
            }
            catch (Exception ex)
            {
                _logger.Warn(ex, "Unable to set last write time");
            }

            _mediaFileAttributeService.SetFilePermissions(destinationFilePath);

            return bookFile;
        }

        private void EnsureTrackFolder(BookFile bookFile, LocalBook localBook, string filePath)
        {
            EnsureBookFolder(bookFile, localBook.Author, localBook.Book, filePath);
        }

        private void EnsureBookFolder(BookFile bookFile, Author author, Book book, string filePath)
        {
            var trackFolder = Path.GetDirectoryName(filePath);
            var bookFolder = _buildFileNames.BuildBookPath(author);
            var authorFolder = author.Path;
            var rootFolder = new OsPath(authorFolder).Directory.FullPath;

            if (!_diskProvider.FolderExists(rootFolder))
            {
                throw new RootFolderNotFoundException(string.Format("Root folder '{0}' was not found.", rootFolder));
            }

            var changed = false;
            var newEvent = new TrackFolderCreatedEvent(author, bookFile);

            _rootFolderWatchingService.ReportFileSystemChangeBeginning(authorFolder, bookFolder, trackFolder);

            if (!_diskProvider.FolderExists(authorFolder))
            {
                CreateFolder(authorFolder);
                newEvent.AuthorFolder = authorFolder;
                changed = true;
            }

            if (authorFolder != bookFolder && !_diskProvider.FolderExists(bookFolder))
            {
                CreateFolder(bookFolder);
                newEvent.BookFolder = bookFolder;
                changed = true;
            }

            if (bookFolder != trackFolder && !_diskProvider.FolderExists(trackFolder))
            {
                CreateFolder(trackFolder);
                newEvent.TrackFolder = trackFolder;
                changed = true;
            }

            if (changed)
            {
                _eventAggregator.PublishEvent(newEvent);
            }
        }

        private void CreateFolder(string directoryName)
        {
            Ensure.That(directoryName, () => directoryName).IsNotNullOrWhiteSpace();

            var parentFolder = new OsPath(directoryName).Directory.FullPath;
            if (!_diskProvider.FolderExists(parentFolder))
            {
                CreateFolder(parentFolder);
            }

            try
            {
                _diskProvider.CreateFolder(directoryName);
            }
            catch (IOException ex)
            {
                _logger.Error(ex, "Unable to create directory: {0}", directoryName);
            }

            _mediaFileAttributeService.SetFolderPermissions(directoryName);
        }
    }
}

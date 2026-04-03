import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { HTML5toTouch } from 'rdndmb-html5-to-touch'; // New import path
import { DndProvider } from 'react-dnd-multi-backend';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormInputHelpText from 'Components/Form/FormInputHelpText';
import FormLabel from 'Components/Form/FormLabel';
import Button from 'Components/Link/Button';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { inputTypes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import TableOptionsColumn from './TableOptionsColumn';
import TableOptionsColumnDragPreview from './TableOptionsColumnDragPreview';
import TableOptionsColumnDragSource from './TableOptionsColumnDragSource';
import styles from './TableOptionsModal.css';

const TableOptionsModal = (props) => {
  const {
    isOpen,
    columns,
    pageSize: initialPageSize,
    canModifyColumns,
    optionsComponent: OptionsComponent,
    onTableOptionChange,
    onModalClose
  } = props;

  // State Management
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [hasPageSize, setHasPageSize] = useState(!!initialPageSize);
  const [pageSizeError, setPageSizeError] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);

  // Sync pageSize from props (replacing componentDidUpdate)
  useEffect(() => {
    setPageSize(initialPageSize);
    setHasPageSize(!!initialPageSize);
  }, [initialPageSize]);

  // Listeners
  const onPageSizeChange = ({ value }) => {
    let error = null;
    if (value < 5) {
      error = 'Page size must be at least 5';
    } else if (value > 250) {
      error = 'Page size must not exceed 250';
    } else {
      onTableOptionChange({ pageSize: value });
    }
    setPageSize(value);
    setPageSizeError(error);
  };

  const onVisibleChange = ({ name, value }) => {
    const updatedColumns = _.cloneDeep(columns);
    const column = _.find(updatedColumns, { name });
    if (column) {
      column.isVisible = value;
      onTableOptionChange({ columns: updatedColumns });
    }
  };

  const onColumnDragMove = (newDragIndex, newDropIndex) => {
    if (dragIndex !== newDragIndex || dropIndex !== newDropIndex) {
      setDragIndex(newDragIndex);
      setDropIndex(newDropIndex);
    }
  };

  const onColumnDragEnd = (item, didDrop) => {
    if (didDrop && dropIndex !== null) {
      const updatedColumns = _.cloneDeep(columns);
      const items = updatedColumns.splice(dragIndex, 1);
      updatedColumns.splice(dropIndex, 0, items[0]);
      onTableOptionChange({ columns: updatedColumns });
    }
    setDragIndex(null);
    setDropIndex(null);
  };

  const isDragging = dropIndex !== null;
  const isDraggingUp = isDragging && dropIndex < dragIndex;
  const isDraggingDown = isDragging && dropIndex > dragIndex;

  return (
    <DndProvider options={HTML5toTouch}>
      <Modal isOpen={isOpen} onModalClose={onModalClose}>
        {isOpen && (
          <ModalContent onModalClose={onModalClose}>
            <ModalHeader>Table Options</ModalHeader>
            <ModalBody>
              <Form>
                {hasPageSize && (
                  <FormGroup>
                    <FormLabel>{translate('PageSize')}</FormLabel>
                    <FormInputGroup
                      type={inputTypes.NUMBER}
                      name="pageSize"
                      value={pageSize || 0}
                      helpText={translate('PageSizeHelpText')}
                      errors={pageSizeError ? [{ message: pageSizeError }] : undefined}
                      onChange={onPageSizeChange}
                    />
                  </FormGroup>
                )}

                {OptionsComponent && (
                  <OptionsComponent onTableOptionChange={onTableOptionChange} />
                )}

                {canModifyColumns && (
                  <FormGroup>
                    <FormLabel>{translate('Columns')}</FormLabel>
                    <div>
                      <FormInputHelpText text="Choose which columns are visible and which order they appear in" />
                      <div className={styles.columns}>
                        {columns.map((column, index) => {
                          const { name, label, columnLabel, isVisible, isModifiable } = column;
                          if (isModifiable !== false) {
                            return (
                              <TableOptionsColumnDragSource
                                key={name}
                                name={name}
                                label={columnLabel || label}
                                isVisible={isVisible}
                                isModifiable={true}
                                index={index}
                                isDragging={isDragging}
                                isDraggingUp={isDraggingUp}
                                isDraggingDown={isDraggingDown}
                                onVisibleChange={onVisibleChange}
                                onColumnDragMove={onColumnDragMove}
                                onColumnDragEnd={onColumnDragEnd}
                              />
                            );
                          }
                          return (
                            <TableOptionsColumn
                              key={name}
                              name={name}
                              label={columnLabel || label}
                              isVisible={isVisible}
                              index={index}
                              isModifiable={false}
                              onVisibleChange={onVisibleChange}
                            />
                          );
                        })}
                        <TableOptionsColumnDragPreview />
                      </div>
                    </div>
                  </FormGroup>
                )}
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button onPress={onModalClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
    </DndProvider>
  );
};

TableOptionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  pageSize: PropTypes.number,
  canModifyColumns: PropTypes.bool,
  optionsComponent: PropTypes.elementType,
  onTableOptionChange: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default TableOptionsModal;

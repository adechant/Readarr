import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { TABLE_COLUMN } from 'Helpers/dragTypes';
import TableOptionsColumn from './TableOptionsColumn';
import styles from './TableOptionsColumnDragSource.css';

const TableOptionsColumnDragSource = (props) => {
  const {
    name,
    label,
    isVisible,
    isModifiable,
    index,
    isDraggingUp,
    isDraggingDown,
    onVisibleChange,
    onColumnDragMove,
    onColumnDragEnd
  } = props;

  const ref = useRef(null);

  // 1. Setup Drag Logic (Replaces DragSource)
  const [{ isDragging }, drag] = useDrag({
    type: TABLE_COLUMN,
    item: () => ({ index, name }), // beginDrag
    end: (item, monitor) => {
      onColumnDragEnd(item, monitor.didDrop()); // endDrag
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // 2. Setup Drop Logic (Replaces DropTarget)
  const [{ isOver }, drop] = useDrop({
    accept: TABLE_COLUMN,
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      onColumnDragMove(dragIndex, hoverIndex);

      // Note: In some implementations, you may need to update 
      // item.index = hoverIndex; here to avoid flickering
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // 3. Combine Refs
  drag(drop(ref));

  const isBefore = !isDragging && isDraggingUp && isOver;
  const isAfter = !isDragging && isDraggingDown && isOver;

  return (
    <div
      ref={ref}
      className={classNames(
        styles.columnDragSource,
        isBefore && styles.isDraggingUp,
        isAfter && styles.isDraggingDown
      )}
    >
      {isBefore && (
        <div className={classNames(styles.columnPlaceholder, styles.columnPlaceholderBefore)} />
      )}

      <TableOptionsColumn
        name={name}
        label={typeof label === 'function' ? label() : label}
        isVisible={isVisible}
        isModifiable={isModifiable}
        index={index}
        isDragging={isDragging}
        isOver={isOver}
        connectDragSource={drag} // Pass the drag ref connector
        onVisibleChange={onVisibleChange}
      />

      {isAfter && (
        <div className={classNames(styles.columnPlaceholder, styles.columnPlaceholderAfter)} />
      )}
    </div>
  );
};

TableOptionsColumnDragSource.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  isVisible: PropTypes.bool.isRequired,
  isModifiable: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  isDraggingUp: PropTypes.bool,
  isDraggingDown: PropTypes.bool,
  onVisibleChange: PropTypes.func.isRequired,
  onColumnDragMove: PropTypes.func.isRequired,
  onColumnDragEnd: PropTypes.func.isRequired
};

export default TableOptionsColumnDragSource;

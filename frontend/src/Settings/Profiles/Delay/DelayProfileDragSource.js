import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DELAY_PROFILE } from 'Helpers/dragTypes';
import DelayProfile from './DelayProfile';
import styles from './DelayProfileDragSource.css';

const DelayProfileDragSource = (props) => {
  const {
    id,
    order,
    isDraggingUp,
    isDraggingDown,
    onDelayProfileDragMove,
    onDelayProfileDragEnd,
    ...otherProps
  } = props;

  const ref = useRef(null);

  // 1. Drag Logic (Replaces DragSource HOC)
  const [{ isDragging }, drag] = useDrag({
    type: DELAY_PROFILE,
    item: () => ({ ...props }), // Matches beginDrag(item)
    end: (item, monitor) => {
      onDelayProfileDragEnd(item, monitor.didDrop()); // Matches endDrag
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // 2. Drop Logic (Replaces DropTarget HOC)
  const [{ isOver }, drop] = useDrop({
    accept: DELAY_PROFILE,
    hover(item, monitor) {
      if (!ref.current) return;

      const dragIndex = item.order;
      const hoverIndex = order;

      if (dragIndex === hoverIndex) return;

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Logic from original hover function
      if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
        onDelayProfileDragMove(dragIndex, hoverIndex + 1);
      } else if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
        onDelayProfileDragMove(dragIndex, hoverIndex);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // 3. Combine refs and connectors
  drag(drop(ref));

  const isBefore = !isDragging && isDraggingUp && isOver;
  const isAfter = !isDragging && isDraggingDown && isOver;

  return (
    <div
      ref={ref}
      className={classNames(
        styles.delayProfileDragSource,
        isBefore && styles.isDraggingUp,
        isAfter && styles.isDraggingDown
      )}
    >
      {isBefore && (
        <div
          className={classNames(
            styles.delayProfilePlaceholder,
            styles.delayProfilePlaceholderBefore
          )}
        />
      )}

      <DelayProfile
        id={id}
        order={order}
        isDragging={isDragging}
        isOver={isOver}
        {...otherProps}
        connectDragSource={drag} // Pass the drag connector to the child
      />

      {isAfter && (
        <div
          className={classNames(
            styles.delayProfilePlaceholder,
            styles.delayProfilePlaceholderAfter
          )}
        />
      )}
    </div>
  );
};

DelayProfileDragSource.propTypes = {
  id: PropTypes.number.isRequired,
  order: PropTypes.number.isRequired,
  isDraggingUp: PropTypes.bool,
  isDraggingDown: PropTypes.bool,
  onDelayProfileDragMove: PropTypes.func.isRequired,
  onDelayProfileDragEnd: PropTypes.func.isRequired
};

export default DelayProfileDragSource;

import PropTypes from 'prop-types';
import React from 'react';
import { useDragLayer } from 'react-dnd';
import DragPreviewLayer from 'Components/DragPreviewLayer';
import { DELAY_PROFILE } from 'Helpers/dragTypes';
import dimensions from 'Styles/Variables/dimensions.js';
import DelayProfile from './DelayProfile';
import styles from './DelayProfileDragPreview.css';

const dragHandleWidth = parseInt(dimensions.dragHandleWidth);

const DelayProfileDragPreview = ({ width }) => {
  // 1. Extract drag state using the hook
  const { item, itemType, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset()
  }));

  // 2. Early return if not dragging the correct item type
  if (!currentOffset || itemType !== DELAY_PROFILE) {
    return null;
  }

  // 3. Calculate positioning logic
  const { x, y } = currentOffset;
  const handleOffset = width - dragHandleWidth;
  const transform = `translate3d(${x - handleOffset}px, ${y}px, 0)`;

  const style = {
    width,
    position: 'absolute',
    WebkitTransform: transform,
    msTransform: transform,
    transform
  };

  return (
    <DragPreviewLayer>
      <div className={styles.dragPreview} style={style}>
        <DelayProfile isDragging={false} {...item} />
      </div>
    </DragPreviewLayer>
  );
};

DelayProfileDragPreview.propTypes = {
  width: PropTypes.number.isRequired
};

export default DelayProfileDragPreview;

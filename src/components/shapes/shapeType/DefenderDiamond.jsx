//DefenderDiamond.jsx
import React, { useRef } from 'react';
import { Rect, Group, Transformer } from 'react-konva';
import ContextMenu from '../../menus/ContextMenu';
import EditableText from '../EditableText';

const DefenderDiamond = (props) => {
    const {
        id,
        startDrawing,
        setIsMouseDownOnAnchor,
        shapeRef,
        position,
        initialColor,
        showContextMenu,
        contextMenuPosition,
        handleOnClick,
        handleRightClick,
        handleDeleteClick,
        handleDragStart,
        handleDragMove,
        handleDragEnd,
        handleHideContextMenu,
        fontSize,
        handleTextChange,
        diamondSize,
        text,
        dragBoundFunc,
        selectedShapeID,
        setSelectedShapeID,
        selectedColor
    } = props;

    const isSelected = (selectedShapeID && selectedShapeID?.find?.(i => i === id)) ?? false;

    const haloOffset = 12;
    const strokeOptions = { color: initialColor != '#FFFFFF' ? 'white' : 'black', strokeWidth: .5 };
    var textAlignment = -5;
    if (text.length > 1) {
        textAlignment -= 5;
    }

    return (
        <>
            <Group
                ref={shapeRef}
                x={position.x}
                y={position.y}
                draggable = {isSelected ? true : false}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                dragBoundFunc={dragBoundFunc}
                onClick={handleOnClick}
                onContextMenu={handleRightClick}
            >
                {isSelected && (
                    <Rect
                        width={diamondSize.width + haloOffset}
                        height={diamondSize.height + haloOffset}
                        rotation={45}
                        // stroke={strokeOptions.color}
                        strokeWidth={2}
                        cornerRadius={2}
                        fill='white'
                        shadowBlur={15}
                        shadowColor='#184267'
                        offsetX={(diamondSize.width + haloOffset) / 2}
                        offsetY={(diamondSize.height + haloOffset) / 2}
                        onMouseDown={(e) => {
                            const startPos = e.target.getStage().getPointerPosition();
                            //console.log('Shape Halo onMouseDown', startPos);
                            startDrawing(startPos, id, null, position);
                            setIsMouseDownOnAnchor(true);
                            e.cancelBubble = true;
                        }}
                        onMouseEnter={(e) => {
                            const container = e.target.getStage().container();
                            //To style it, import custom image
                            //container.style.cursor = 'url(/path/to/your/cursor/image.png) 16 16, crosshair';
                            container.style.cursor = 'crosshair';
                        }}
                        onMouseLeave={(e) => {
                            const container = e.target.getStage().container();
                            container.style.cursor = 'default';
                        }}
                    />
                )}
                <Rect
                    width={diamondSize.width}
                    height={diamondSize.height}
                    rotation={45}
                    stroke={strokeOptions.color}
                    offsetX={diamondSize.width / 2}
                    offsetY={diamondSize.height / 2}
                    strokeWidth={strokeOptions.strokeWidth}
                    cornerRadius={2}
                    fill={initialColor}
                />
                <EditableText
                    initialText={text}
                    x={textAlignment}
                    y={-6}
                    fontSize={fontSize}
                    handleTextChange={handleTextChange}
                    color={ initialColor == 'black' || initialColor == '#000000' ? "white": initialColor == 'white' || initialColor == '#FFFFFF'|| initialColor == 'transparent' ? 'black':"white"}
                />
            </Group>
            {showContextMenu && <ContextMenu position={contextMenuPosition} onDelete={handleDeleteClick} onMouseLeave={handleHideContextMenu} />}
        </>
    );
};

export default DefenderDiamond;
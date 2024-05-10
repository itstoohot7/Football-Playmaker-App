// ReceiverOval.jsx
import React from 'react';
import { Group, Ellipse } from 'react-konva';
import ContextMenu from '../../menus/ContextMenu';
import EditableText from '../EditableText';

function ReceiverOval(props) {
    const {
        startDrawing,
        setIsMouseDownOnAnchor,
        id,
        shapeRef,
        imageRef,
        stageRef,
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
        handleTextChange,
        handleHideContextMenu,
        ellipseRadiuses,
        fontSize,
        text,
        dragBoundFunc,
        selectedShapeID,
        setSelectedShapeID,
        selectedColor
    } = props;

    // const isSelected = selectedShapeID === id;
    const isSelected = (selectedShapeID && selectedShapeID?.find?.(i => i === id)) ?? false;

    // const strokeOptions = { color: 'black', strokeWidth: 2 };
    const strokeOptions = { color:initialColor == selectedColor && initialColor != '#FFFFFF' ? 'white' : 'black', strokeWidth: .5 };

    const haloRadiuses = { x: ellipseRadiuses.x + 8, y: ellipseRadiuses.y + 8 };

    var textAlignment = -5;
    if (text.length > 1) {
        textAlignment -= 5;
    }

    return (
        <>
            <Group
                draggable = {isSelected ? true : false}
                dragBoundFunc={dragBoundFunc}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onClick={handleOnClick}
                onContextMenu={handleRightClick}
                ref={shapeRef}
                x={position.x}
                y={position.y}
            >
                {isSelected && (
                    <Ellipse
                        x={0}
                        y={0}
                        fill="white"
                        radiusX={haloRadiuses.x}
                        radiusY={haloRadiuses.y}
                        // stroke={'black'}
                        strokeWidth={5}
                        shadowBlur={15}
                        shadowColor='#184267'
                        onMouseDown={(e) => {
                            const startPos = e.target.getStage().getPointerPosition();
                            //console.log('Shape Halo onMouseDown', startPos);
                            ////console.log(position);
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
                <Ellipse
                    x={0}
                    y={0}
                    radiusX={ellipseRadiuses.x}
                    radiusY={ellipseRadiuses.y}
                    stroke={strokeOptions.color}
                    strokeWidth={strokeOptions.strokeWidth}
                    fill={initialColor}
                    opacity={1}
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
}

export default ReceiverOval;
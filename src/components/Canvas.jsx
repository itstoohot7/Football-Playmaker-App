// Canvas.jsx
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Stage, Layer, Image, Rect, Line, Transformer, Group, Text } from 'react-konva';
import useImage from 'use-image';
import Shape from './shapes/Shape';
import TextTag from './shapes/TextTag';
import CustomLine from './shapes/CustomLine';
import LoadedLayer from './shapes/LoadedLayer';
import LineContextMenu from '../components/menus/LineContextMenu';
import { colorButtons } from './Stencil';
import { throttle } from 'lodash';



function Canvas(props) {
    const {
        currentLayerData,
        setCurrentLayerData,
        startPos,
        endPos,
        lines,
        setLines,
        onLineChange,
        startDrawing,
        draw,
        stopDrawing,
        deleteAllLines,
        colorButtonPressCount,
        strokeTypeButtonPressCount,
        setStrokeTypeButtonPressCount,
        strokeEndButtonPressCount,
        setStrokeEndButtonPressCount,
        onLineDelete,
        imageRef,
        stageRef,
        shapes,
        setShapes,
        setSelectedColor,
        selectedShapes,
        setSelectedShapes,
        onSelect,
        onShapeChange,
        onShapeDelete,
        textTags,
        selectedTextTags,
        setSelectedTextTags,
        onTextTagChange,
        onTextTagDelete,
        onHideTextTagContextMenu,
        onHideContextMenu,
        selectedColor,
        selectedLineStroke,
        selectedLineEnd,
        setSelectedLineEnd,
        backgroundImage,
        setStageDimensions,
        orientation,
        selectedLineID,
        setSelectedLineID,
        waterMark,
        setWatermark,
        selectedColorButton,
        setSelectedColorButton,
    } = props;
    const trRef = useRef(null);
    const shapeRef = useRef([]);
    const selectionRef = useRef();
    const layerRef = React.useRef();
    const groupRef = React.useRef();
    // console.log("Canvas Start Position===>",startPos)
    const [selectionBox, setSelectionBox] = useState(null);
    const [isSelectedBox, setIsSelectedBox] = useState();
    const [transformed, setTransformer] = useState();
    //const { stageDimensions } = useContext(StageDimensionsContext);
    const containerRef = useRef(null);
    const [image] = useImage(backgroundImage);
    const [isMouseDownOnAnchor, setIsMouseDownOnAnchor] = useState(false);
    const [selectedShapeID, setSelectedShapeID] = useState([]);
    const [selectedTextTagID, setSelectedTextTagID] = useState('$');
    const [initialMousePosition, setInitialMousePos] = useState();
    const [hasBeenSelected, setHasBeenSelected] = useState(false);
    const deselectShape = () => setSelectedShapeID([]);
    const deselectTextTag = () => setSelectedTextTagID(null);
    const updateSelectedTextTagsColor = (newColor) => {
        selectedTextTags.forEach(tag => {
            onTextTagChange(tag.id, { color: newColor });
        });
    };

    useEffect(() => {
        updateSelectedTextTagsColor(selectedColor);
    }, [selectedColor]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const line = lines.find(line => line.id === selectedLineID);

            if (event.key === 'Delete' && line) {
                handleDeleteClick();
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedLineID, lines]);


    useEffect(() => {
        function fitStageIntoParentContainer() {
            if (containerRef.current && stageRef.current) {
                const { offsetWidth, offsetHeight } = containerRef.current;

                stageRef.current.width(offsetWidth);
                stageRef.current.height(offsetHeight);
                stageRef.current.draw();

                setStageDimensions({ width: offsetWidth, height: offsetHeight });
            }
        }

        function handleResize() {
            fitStageIntoParentContainer();
        }

        fitStageIntoParentContainer();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (selectionBox) {
            setIsSelectedBox(true)
            setTransformer(true)
        }
    }, [selectionBox]);

    //Line context menu functions//
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [startPosSelectionBox, setStartSelectionBoxPos] = useState();
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });


    const handleDeleteClick = () => {
        const line = lines.find(line => line.id === selectedLineID);

        if (line) {
            setShowContextMenu(false);
            onLineDelete(selectedLineID);
        }
    };

    const handleHideContextMenu = () => {
        setShowContextMenu(false);
        setSelectedLineID('$');
    }
    ///////////////////////////////////////////

    const handleImageClick = (e) => {
        // //console.log('BG Image Clicked', backgroundImage);
        // //console.log('Image Dimensions:', image.width, image.height);
        // //console.log('Image Position:', imageRef.current.x(), imageRef.current.y());
        // //console.log('Image Size:', imageRef.current.width(), imageRef.current.height());
        // //console.log('Selected Shapes', selectedShapes);
        // //console.log('Selected Text Tags', selectedTextTags);

        setIsSelectedBox(null)
        deselectShape();
        deselectTextTag();
        setSelectedTextTags([]);
        setSelectedLineID('$');
        setHasBeenSelected(false);
        handleStageClick(e)
    }

    const handleStageClick = (e) => {
        //console.log('Stage Clicked');
        // //console.log('Shapes List:', shapes);
        // //console.log('Text Tags List:', textTags);
        // //console.log('Lines List:', lines);
        // //console.log('Current Layer Data:', currentLayerData);
        // //console.log('Selection Box:', selectionBox);
        // setSelectionBox(null)
        // setIsSelectedBox(null)

        // if clicked on empty area - remove all selections
        if (e.target === e.target.getStage()) {
            setSelectedShapeID([])
            setSelectedShapes([]);
            setSelectionBox(null)
            deselectShape();
            deselectTextTag();
            setSelectedTextTags([]);
            setSelectedLineID('$');
            setHasBeenSelected(false);
            setIsSelectedBox(true)

        }
    };

    const handleStageMouseDown = (e) => {
        // const pos = e.target.getStage().getPointerPosition();

        const pointerPos = e?.target?.getStage()?.getPointerPosition()
        if (!selectionBox) {

            //    trRef.current && //console.log("Tref Current in mouse down ==>", trRef)
            setStartSelectionBoxPos(pointerPos);

            setSelectionBox({
                x: pointerPos?.x,
                y: pointerPos?.y,
                width: 0,
                height: 0
            })
        }
    };



    //draws the line
    const handleStageMouseMove = (e) => {

        const pointerPos = e.target?.getStage()?.getPointerPosition();
        setInitialMousePos(pointerPos);
        // trRef?.current &&
        // //console.log("Tref Current in mouse move ==>", trRef)

        if (isMouseDownOnAnchor && e.evt.buttons === 1) {
            const pos = e?.target?.getStage()?.getPointerPosition();
            console.log("Lines==>", lines)
            if (lines)
                draw(pos);
            else {

                const dx = pointerPos.x - startPosSelectionBox.x;
                const dy = pointerPos.y - startPosSelectionBox.y;

                // Update the position of the selection box by adding the displacement
                setSelectionBox({
                    x: selectionBox?.x + dx,
                    y: selectionBox?.y + dy,
                    width: selectionBox?.width,
                    height: selectionBox?.height
                });
            }
            // Update the initial mouse position for the next movement


        }
        else
            if (e.evt.buttons === 1) {
                const pointerPos = e?.target?.getStage()?.getPointerPosition()

                setSelectionBox({
                    ...selectionBox,
                    width: pointerPos?.x - selectionBox?.x,
                    height: pointerPos?.y - selectionBox?.y
                })
            }

    };

    const isInteracting = (lineEndPos, nodeId, nodeType) => {
        if (nodeType === "shape") {
            // Check if the line end point is inside the bounding box of the shape
            const node = shapes.find(shape => shape.id === nodeId);
            if (node) {
                return (
                    lineEndPos.x >= node.x &&
                    lineEndPos.x <= node.x + node.width &&
                    lineEndPos.y >= node.y &&
                    lineEndPos.y <= node.y + node.height
                );
            }
        }
        // else if (nodeType === "line") {
        //     // Check if the line end point coincides with the end point of the other line
        //     const otherLine = lines.find(line => line.id === nodeId);
        //     if (otherLine) {
        //         return (
        //             lineEndPos.x === otherLine.endPos.x &&
        //             lineEndPos.y === otherLine.endPos.y
        //         );
        //     }
        // }
        return false;
    };


    useEffect(() => {
        shapes.map((shape, index) => {
            if (selectedShapeID?.length && selectedShapeID?.includes(shape.id)) {
                console.log("Shape Id", shape)
            }
        })

        console.log("Line===>", lines)

        // isInteracting(lines[0]?.endPos, )
    }, [selectedShapeID, lines])

    // useEffect(() => {
    //     // Function to calculate intersection points between lines and node
    //     const calculateIntersectionPoints = () => {
    //         // Assuming you have line coordinates and node coordinates
    //         //   const nodeX = nodeRef.current.x();
    //         //   const nodeY = nodeRef.current.y();


    //         const intersectionPoints = [];

    //         lines.forEach((line) => {

    //             const dr = Math.sqrt(line.endPos.x + line.endPos.x);
    //             const D = line.startPos.x * line.endPos.y - line.startPos.y * line.endPos.x;

    //             console.log("Dr and D ===> ", dr, D)


    //             // const discriminant =  * dr - D;

    //             // if (discriminant >= 0) {
    //             //   const sqrtDiscriminant = Math.sqrt(discriminant);
    //             //   const x1 = (D * dy + Math.sign(dy) * dx * sqrtDiscriminant) / (dr * dr);
    //             //   const y1 = (-D * dx + Math.abs(dy) * sqrtDiscriminant) / (dr * dr);
    //             //   const x2 = (D * dy - Math.sign(dy) * dx * sqrtDiscriminant) / (dr * dr);
    //             //   const y2 = (-D * dx - Math.abs(dy) * sqrtDiscriminant) / (dr * dr);

    //             //   // Check if the intersection point is within the line segment
    //             //   if (
    //             //     ((x1 - line.x1) * (x1 - line.x2) <= 0 && (y1 - line.y1) * (y1 - line.y2) <= 0) ||
    //             //     ((x2 - line.x1) * (x2 - line.x2) <= 0 && (y2 - line.y1) * (y2 - line.y2) <= 0)
    //             //   ) {
    //             //     intersectionPoints.push({ x: x1, y: y1 });
    //             //   }
    //             // }
    //         });

    //         return intersectionPoints;
    //     };

    //     const intersections = calculateIntersectionPoints();

    //      console.log("intersection points",intersections)

    //     // Here you can handle how to draw the lines from the intersection points to the node
    //     // Example: use intersection points to draw lines using Konva Line components

    // }, [lines]);

    // useEffect(() => {
    //     // Function to calculate intersection points between lines and nodes
    //     const calculateIntersectionPoints = () => {
    //         const intersectionPoints = [];

    //         lines.forEach((line) => {
    //             const dx = line.endPos.x - line.startPos.x;
    //             const dy = line.endPos.y - line.startPos.y;
    //             const dr = Math.sqrt(dx * dx + dy * dy);
    //             const D = line.startPos.x * line.endPos.y - line.startPos.y * line.endPos.x;

    //             const discriminant = dr * dr - D * D;
    //             const nodeRadius = 10; // Assuming a radius for the node

    //             if (discriminant >= 0) {
    //                 const sqrtDiscriminant = Math.sqrt(discriminant);
    //                 const x1 = (D * dy + Math.sign(dy) * dx * sqrtDiscriminant) / (dr * dr);
    //                 const y1 = (-D * dx + Math.abs(dy) * sqrtDiscriminant) / (dr * dr);
    //                 const x2 = (D * dy - Math.sign(dy) * dx * sqrtDiscriminant) / (dr * dr);
    //                 const y2 = (-D * dx - Math.abs(dy) * sqrtDiscriminant) / (dr * dr);

    //                 // Check if the intersection point is within the line segment
    //                 const isInLineSegment = (x, y, x1, y1, x2, y2) => {
    //                     console.log("here")
    //                     return (x - x1) * (x - x2) <= 0 && (y - y1) * (y - y2) <= 0;
    //                 };

    //                 if (isInLineSegment(x1, y1, line.startPos.x, line.startPos.y, line.endPos.x, line.endPos.y)) {
    //                     intersectionPoints.push({ x: x1, y: y1 });
    //                 }
    //                 if (isInLineSegment(x2, y2, line.startPos.x, line.startPos.y, line.endPos.x, line.endPos.y)) {
    //                     intersectionPoints.push({ x: x2, y: y2 });
    //                 }
    //             }
    //         });

    //         return intersectionPoints;
    //     };

    //     const intersections = calculateIntersectionPoints();
    //     console.log("intersection points", intersections);

    //     // Here you can handle how to draw the lines from the intersection points to the node
    //     // Example: use intersection points to draw lines using Konva Line components
    // }, [lines]);



    const [transformBoxStartPosition, setTransformBoxStartPosition] = useState()
    // const handleTransformBoxDrag = (e) => {
    //     const newPosition = e.target.getAbsolutePosition();
    //     // Calculate the delta movement from the previous position to the new position
    //     const deltaX = newPosition.x - transformBoxStartPosition?.x;
    //     const deltaY = newPosition.y - transformBoxStartPosition?.y;

    //     // Update the position of each selected shape
    //     const updatedShapes = shapes.map(shape => {
    //         if (selectedShapeID.includes(shape.id)) {
    //             return {
    //                 ...shape,
    //                 x: shape.x ? shape.x + deltaX : shape.initialPosition.x + deltaX,
    //                 y: shape.y ? shape.y + deltaY : shape.initialPosition.y + deltaY,
    //             };
    //         }
    //         return shape;
    //     });

    //     // Update the state with the updated shapes
    //     setShapes(updatedShapes);
    // }
    const handleTransformBoxDrag = throttle((e) => {
        const newPosition = e.target.getAbsolutePosition();
        // Calculate the delta movement from the previous position to the new position
        const deltaX = newPosition?.x - transformBoxStartPosition?.x;
        const deltaY = newPosition?.y - transformBoxStartPosition?.y;

        // Update the position of each selected shape
        const updatedShapes = shapes.map(shape => {
            if (selectedShapeID.includes(shape.id)) {
                const initialX = shape.x ? shape.x : shape.initialPosition.x;
                const initialY = shape.y ? shape.y : shape.initialPosition.y;
                console.log("initial X", initialX, "delta X", deltaX, "initial Y", initialY, "delta Y", deltaY)
                return {
                    ...shape,
                    x: initialX + deltaX,
                    y: initialY + deltaY,
                };
            }
            return shape;
        });
        console.log("Updated Shapes==>", updatedShapes)
        // Update the state with the updated shapes
        setShapes(updatedShapes);

        // Update the starting position of the transformer for the next drag movement
        setTransformBoxStartPosition(newPosition);
    }, 100);



    const handleStageMouseUp = (e) => {
        const endPos = e.target?.getStage()?.getPointerPosition();
        ////console.log('Stage onMouseUp', endPos);
        ////console.log('Selected Line ID:', selectedLineID);
        //   trRef.current &&  //console.log("Tref Current in mouse Up ==>", trRef)

        stopDrawing();

        setSelectedShapeID([])
        setSelectedShapes([])
        // Check if startPos is defined
        if (!startPosSelectionBox) {
            // Clear the selection box and return
            setSelectionBox(null);
            setIsSelectedBox(null)

            setIsMouseDownOnAnchor(false);
            return;
        }

        // Calculate the top-left and bottom-right coordinates of the selection box
        const x1 = Math.min(startPosSelectionBox.x, endPos.x);
        const y1 = Math.min(startPosSelectionBox.y, endPos.y);
        const x2 = Math.max(startPosSelectionBox.x, endPos.x);
        const y2 = Math.max(startPosSelectionBox.y, endPos.y);

        //console.log("selectedShapesInsideBox===>", shapes)
        // Find shapes inside the selection box
        const selectedShapesInsideBox = shapes.filter(shape => {
            if (shape?.x && shape?.y) {
                return shape?.x >= x1 && shape?.y >= y1 && shape?.x <= x2 && shape?.y <= y2
            }
            else {
                return shape?.initialPosition?.x >= x1 && shape?.initialPosition?.y >= y1 && shape?.initialPosition?.x <= x2 && shape?.initialPosition?.y <= y2
            }
        }
        );

        //console.log(selectedShapesInsideBox)
        if (selectedShapesInsideBox.length > 0) {
            // Extract IDs of selected shapes
            const selectedShapeIDs = selectedShapesInsideBox.map(shape => shape.id);

            // Update selected shape IDs state
            setSelectedShapeID(selectedShapeIDs);

            // Update selected shapes state
            setSelectedShapes(selectedShapesInsideBox);
        }

        // Clear the selection box
        setSelectionBox(null);

        setIsMouseDownOnAnchor(false);
        // setSelectedShapeID('$');
    };

    React.useEffect(() => {
        //console.log("selectedshapedID=>", selectedShapeID);
        if (selectedShapeID?.length) {
            // //console.log("Selected Shape Ids==>",selectedShapeID)

            // trRef?.current?.destroyChildren()

            const allSelectedRefs = selectedShapeID && selectedShapeID?.map(i => shapeRef.current[i])

            if (allSelectedRefs) {
                //console.log("Selected Nodes", allSelectedRefs)

                trRef?.current?.nodes(allSelectedRefs);


            }
        }
        //     }
        // }
    }, [selectedShapeID, selectedShapes]);

    useEffect(() => {

        if (selectedShapeID.length == 1) {
            setSelectedColor(selectedShapes[0]?.initialColor == 'transparent' ? "#FFFFFF" : selectedShapes[0]?.initialColor)
            const colorIndex = colorButtons.findIndex(i =>
                selectedShapes[0]?.initialColor == 'transparent' ? i == "#FFFFFF" : i == selectedShapes[0]?.initialColor)
            setSelectedColorButton(colorIndex == -1 ? 0 : colorIndex)
        }
        else {
            // setSelectedColor(selectedShapes[0]?.initialColor == 'transparent' ? "#FFFFFF" : selectedShapes[0]?.initialColor)
            setSelectedColorButton(-1)
        }
    }, [selectedShapes])


    useEffect(() => {

        onShapeChange(selectedShapeID, { initialColor: selectedColor })

    }, [selectedColor])


    const [oldPlayNamePos, setOldPlayNamePos] = useState({ x: 0, y: 0 });
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        setOldPlayNamePos(playNamePos);
        setImageLoaded(false);
    }, [image]);

    //simulate image loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setImageLoaded(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, [image]);

    const middlePosition = {
        x: imageRef.current?.x() + (imageRef.current?.width() / 2),
        y: imageRef.current?.height() / 2
    };

    const imageSize = {
        width: imageRef.current?.width(),
        height: imageRef.current?.height()
    };

    const playNamePos = imageLoaded
        ? { x: middlePosition?.x - imageSize?.width * 0.47, y: middlePosition?.y - imageSize?.height * 0.475 }
        : oldPlayNamePos;

    const handleTransformerTransform = (e) => {
        console.log("on transformer transform==>", e)
        const transformerNode = trRef.current;
        const newPosition = transformerNode.getAbsolutePosition();
        const deltaX = newPosition.x - transformBoxStartPosition.x;
        const deltaY = newPosition.y - transformBoxStartPosition.y;

        // Update the position of each selected shape
        const updatedShapes = shapes.map(shape => {
            if (selectedShapeID.includes(shape.id)) {
                const initialX = shape.x ? shape.x : shape.initialPosition.x;
                const initialY = shape.y ? shape.y : shape.initialPosition.y;
                return {
                    ...shape,
                    x: initialX + deltaX,
                    y: initialY + deltaY,
                };
            }
            return shape;
        });

        // Update the state with the updated shapes
        setShapes(updatedShapes);

        // Update the starting position of the transformer for the next drag movement
        setTransformBoxStartPosition(newPosition);
    };


    return (
        <>
            <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '90%' }}>
                <Stage
                    ref={stageRef}
                    width={containerRef.current ? containerRef.current.offsetWidth : 0}
                    height={containerRef.current ? containerRef.current.offsetHeight : 0}
                    onClick={handleStageClick}
                    onMouseDown={handleStageMouseDown}
                    onMouseMove={handleStageMouseMove}
                    onMouseUp={handleStageMouseUp}
                >
                    <Layer ref={layerRef}>
                        <Image
                            ref={imageRef}
                            x={stageRef.current ? (stageRef.current.width() - (image ? image.width * (containerRef.current ? containerRef.current.offsetHeight / image.height : 0) : 0)) / 2 : 0}
                            y={stageRef.current ? (stageRef.current.height() - (image ? image.height * (containerRef.current ? containerRef.current.offsetHeight / image.height : 0) : 0)) / 2 : 0}
                            image={image}
                            width={image ? image.width * (containerRef.current ? containerRef.current.offsetHeight / image.height : 0) : 0}
                            height={image ? image.height * (containerRef.current ? containerRef.current.offsetHeight / image.height : 0) : 0}
                        // onClick={handleImageClick}
                        />
                        {waterMark && (
                            <Image
                                image={waterMark}
                                width={waterMark ? waterMark.width / 15 * (containerRef.current ? containerRef.current.offsetHeight / waterMark.height : 0) : 0}
                                height={waterMark ? waterMark.height / 15 * (containerRef.current ? containerRef.current.offsetHeight / waterMark.height : 0) : 0}
                                x={stageRef.current ? (stageRef.current.width() + (waterMark ? waterMark.width / 1.4 * (containerRef.current ? containerRef.current.offsetHeight / waterMark.height : 0) : 0)) / 2 : 0}
                                y={stageRef.current ? (stageRef.current.height() + (waterMark ? waterMark.height / 1.4 * (containerRef.current ? containerRef.current.offsetHeight / waterMark.height : 0) : 0)) / 2 : 0}
                            />
                        )}
                        <Text
                            text={currentLayerData?.name}
                            x={playNamePos?.x}
                            y={playNamePos.y}
                            textDecoration='none'
                            fontSize={22}
                            fontStyle='bold'
                            fontFamily='Inter, sans-serif'
                            fill={'black'}
                        />
                        {/* Sorting causes lines to render later */}
                        {lines.sort((a, b) => (a.id === selectedLineID ? 1 : -1)).map((line, index) => (
                            <CustomLine
                                key={line.id}
                                id={line.id}
                                line={line}
                                lines={lines}
                                color={line.color}
                                setSelectedLineEnd={setSelectedLineEnd}
                                colorButtonPressCount={colorButtonPressCount}
                                strokeTypeButtonPressCount={strokeTypeButtonPressCount}
                                strokeEndButtonPressCount={strokeEndButtonPressCount}
                                setStrokeTypeButtonPressCount={setStrokeTypeButtonPressCount}
                                setStrokeEndButtonPressCount={setStrokeEndButtonPressCount}
                                // selectedColor={selectedColor == '#FFFFFF' ? '#000000' : selectedColor}
                                selectedColor={'#000000'}
                                selectedLineStroke={selectedLineStroke}
                                selectedLineEnd={selectedLineEnd}
                                onLineDelete={onLineDelete}
                                onLineChange={onLineChange}
                                setLines={setLines}
                                selectedLineID={selectedLineID}
                                setSelectedLineID={setSelectedLineID}
                                setIsMouseDownOnAnchor={setIsMouseDownOnAnchor}
                                startDrawing={startDrawing}
                                stageRef={stageRef}
                                imageRef={imageRef}
                                setContextMenuPosition={setContextMenuPosition}
                                setShowContextMenu={setShowContextMenu}
                            />
                        ))}
                        <Group ref={groupRef}>
                            {shapes.map((shape) => (
                                <React.Fragment key={shape.id}>
                                    <Shape
                                        // shapeRef={shapeRef}
                                        shapeRef={el => shapeRef.current[shape.id] = el ?? ''}
                                        selectedLineEnd={selectedLineEnd}
                                        setSelectedLineEnd={setSelectedLineEnd}
                                        hasBeenSelected={hasBeenSelected}
                                        setHasBeenSelected={setHasBeenSelected}
                                        lines={lines}
                                        setLines={setLines}
                                        setIsMouseDownOnAnchor={setIsMouseDownOnAnchor}
                                        startDrawing={startDrawing}
                                        id={shape.id}
                                        shapeType={shape.shapeType}
                                        selectedColor={selectedColor}
                                        shapes={shapes}
                                        initialPosition={shape.initialPosition}
                                        transformed={(props) => setTransformer(props)}
                                        // initialColor={selectedShapeID?.length && selectedShapeID?.includes(shape.id) ? changedColor : shape.initialColor ?? shape.initialColor}
                                        initialColor={shape.initialColor}
                                        onShapeChange={onShapeChange}
                                        onShapeDelete={onShapeDelete}
                                        onLineDelete={onLineDelete}
                                        onHideContextMenu={onHideContextMenu}
                                        stageRef={stageRef}
                                        imageRef={imageRef}
                                        selectedShapes={selectedShapes}
                                        setSelectedShapes={setSelectedShapes}
                                        selectedShapeID={selectedShapeID}
                                        setSelectedShapeID={setSelectedShapeID}
                                    />
                                    {/* {changedTranformer(shape)} */}
                                    {transformed && selectedShapeID.includes(shape.id) && isSelectedBox && (
                                        <Transformer
                                            key={`transformer_${shape.id}`}
                                            ref={trRef}
                                            onDragStart={(e) => {
                                                const position = e.target.getAbsolutePosition()
                                                setTransformBoxStartPosition(position)
                                            }}
                                            onTransform={handleTransformerTransform}
                                            // onDragMove={(e) => handleTransformBoxDrag(e)}
                                            // onDragEnd={(e) => {
                                            //     handleTransformBoxDrag(e)
                                            // }}
                                            onDragMove={handleTransformBoxDrag}
                                        // onMouseLeave={(e) => {
                                        //     debugger
                                        //     //console.log("Drag End")
                                        // }}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                            {/* Render text tags */}
                        </Group>

                        {textTags.map((textTag) => (
                            <TextTag
                                key={textTag.id}
                                id={textTag.id}
                                text={textTag.text}
                                textTags={textTags}
                                initialPosition={textTag.initialPosition}
                                selectedColor={selectedColor}
                                color={textTag.color}
                                onTextTagChange={onTextTagChange}
                                onTextTagDelete={onTextTagDelete}
                                onHideTextTagContextMenu={onHideTextTagContextMenu}
                                imageRef={imageRef}
                                setSelectedTextTags={setSelectedTextTags}
                                selectedTextTagID={selectedTextTagID} setSelectedTextTagID={setSelectedTextTagID}
                            />
                        ))}
                        {/* drawing line */}
                        {startPos && endPos && (
                            <Line
                                points={[startPos.x, startPos.y, endPos.x, endPos.y]}
                                stroke="#ACC8DD"
                                strokeWidth={4}
                                tension={0.5}
                                lineCap="round"
                            />
                        )}
                        {showContextMenu &&
                            <LineContextMenu
                                position={contextMenuPosition}
                                onDelete={handleDeleteClick}
                                onMouseLeave={handleHideContextMenu}
                                setSelectedLineEnd={setSelectedLineEnd}
                                selectedLineEnd={selectedLineEnd}
                                setStrokeEndButtonPressCount={setStrokeEndButtonPressCount}
                                //below not implemented yet
                                setStrokeTypeButtonPressCount={setStrokeTypeButtonPressCount}
                            />
                        }
                        {
                            selectionBox && <Rect
                                {...selectionBox}
                                fill="#D9F0F970"
                                // style={{ fillOpacity: 0.5 }} 
                                ref={selectionRef}


                            />
                        }
                    </Layer>

                </Stage>

            </div>
        </>
    );
}
export default Canvas;

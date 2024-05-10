// App.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import StageDimensionsContext from './contexts/StageDimensionsContext';
import Canvas from './components/Canvas';
import Stencil from './components/Stencil';
import useShapes from './hooks/useShapes';
import useTextTags from './hooks/useTextTags';
import useBackground from './hooks/useBackground';
import { ThemeProvider } from '@mui/material/styles';
import theme from './config/theme';
import CloseIcon from '@mui/icons-material/Close';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { BsTrash3Fill } from "react-icons/bs";
import RemoveModeratorIcon from '@mui/icons-material/RemoveModerator';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import { PiFileJpg } from "react-icons/pi";
import { PiFilePng } from "react-icons/pi";
import FontDownloadOffIcon from '@mui/icons-material/FontDownloadOff';
import { AiOutlineDeleteColumn } from "react-icons/ai";
import { LuLogOut } from "react-icons/lu";
import { IoIosAdd } from "react-icons/io";
import './App.css';
import useLines from './hooks/useLines';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UpdateIcon from '@mui/icons-material/Update';
import Grid from '@mui/material/Grid';
import { Button, ButtonGroup, backdropClasses } from '@mui/material';

import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const options = ['Delete', 'Rename', 'Duplicate', 'Save'];

////////////////////////////////////////////////////////////////////////////////////////
/*
TODO: undo/redo
TODO: orientation
TODO: selection rectangle
*/
////////////////////////////////////////////////////////////////////////////////////////
function App({ signOut, setCurrentUser, showAuthenticator, setShowAuthenticator }) {
  const imageRef = useRef(null);
  const stageRef = useRef(null);
  const [colorButtonPressCount, setColorButtonPressCount] = useState(0);
  const [strokeTypeButtonPressCount, setStrokeTypeButtonPressCount] = useState(0);
  const [strokeEndButtonPressCount, setStrokeEndButtonPressCount] = useState(0);
  const [selectedShapes, setSelectedShapes] = useState([]); //This is for Selection Rectangle
  const [selectedTextTags, setSelectedTextTags] = useState([]);
  const [selectedLineID, setSelectedLineID] = useState('$');
  const [selectedColor, setSelectedColor] = useState(theme.palette.white.main); //default color
  const [selectedLineStroke, setSelectedLineStroke] = useState('straight'); // default straight line
  const [selectedLineEnd, setSelectedLineEnd] = useState('straight'); // default arrow line end
  const [stageDimensions, setStageDimensions] = useState({ width: 0, height: 0 });
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [currentLayerData, setCurrentLayerData] = useState(null);
  const { backgroundImage, fieldType, setFieldType, setZone, zone, setRedLine, redLine, waterMark, setWatermark } = useBackground();
  const { lines, startPos, endPos, startDrawing, draw, stopDrawing, deleteAllLines, setLines, deleteLine, updateLine } = useLines(imageRef, setSelectedLineID, selectedLineID);
  const { shapes, setShapes, addFormation, addShape, updateShape, deleteShape, deleteFormation, deleteAllShapes, hideShapeContextMenu, flipAllShapes } = useShapes(imageRef, lines, setLines);
  const { textTags, setTextTags, addTextTag, updateTextTag, deleteTextTag, deleteAllTextTags, hideTextTagContextMenu, flipAllTextTags } = useTextTags(imageRef);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipTimeoutId, setTooltipTimeoutId] = useState(null);
  const [items, setItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogText, setDialogText] = useState('');
  const [dialogAction, setDialogAction] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedColorButton, setSelectedColorButton] = useState(0); // 0 is first index of colorButtons array

  const handleDownloadPNG = () => {
    setSnackbarMessage('Downloading PNG...');
    setSnackbarSeverity('info');
    setOpenSnackbar(true);

    setTimeout(() => {
      var dataURL = stageRef.current.toDataURL({ pixelRatio: 3 });
      var link = document.createElement('a');
      if (currentLayerData === null) {
        link.download = 'untitled.png';
      } else {
        link.download = `${currentLayerData.name}.png`
      }
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setOpenSnackbar(false);
    }, 1000);
  };

  const handleDownloadJPG = () => {
    setSnackbarMessage('Downloading JPG...');
    setSnackbarSeverity('info');
    setOpenSnackbar(true);

    setTimeout(() => {
      var dataURL = stageRef.current.toDataURL({ pixelRatio: 3, mimeType: "image/jpg" });
      var link = document.createElement('a');
      if (currentLayerData === null) {
        link.download = 'untitled.jpg';
      } else {
        link.download = `${currentLayerData.name}.jpg`
      }
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setOpenSnackbar(false);
    }, 1000);
  };

  useEffect(() => {
    const updatedItem = {
      ...currentLayerData,
      textTagList: textTags,
      shapeList: shapes,
      lineList: lines,
    };

    setItems((prevItems) => prevItems.map((item, i) => item.id === currentLayerData?.id ? updatedItem : item))


  }, [lines, shapes, textTags])

  const checkIfDrawerEmpty = () => {
    if (items.length === 0) {
      //console.log('Play drawer is empty');
      // //Create empty objects for everything
      const newItem = {
        id: uuidv4(),
        name: 'Untitled',
        backgroundImage: backgroundImage,
        textTagList: [],
        shapeList: [],
        lineList: [],
        //drawingLine: (startPos && endPos)
      };
      setItems([newItem]);
      setCurrentLayerData(newItem);
    }
  };
  const handleDeleteAll = () => {
    deleteAllShapes();
    deleteAllTextTags();
    deleteAllLines();
  };

  const handleDeleteDefenseFormation = () => {
    setShapes(shapes.filter(shape => !shape.formationType.toLowerCase().startsWith('defense')));
  }
  const handleDeleteOffenseFormation = () => {
    setShapes(shapes.filter(shape => !shape.formationType.toLowerCase().startsWith('offense')));
  }
  const handleDeleteAllTextTags = () => {
    deleteAllTextTags();
  };

  const handleDeleteAllLines = () => {
    deleteAllLines();
  };

  const handleToggleSpeedDial = () => {
    setIsSpeedDialOpen(!isSpeedDialOpen);
  };


  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleDialogSubmit = () => {
    dialogAction(dialogText);
    closeDialog();
  };
  const handleSignOut = async () => {
    try {
      setCurrentUser(null);
      setShowAuthenticator(!showAuthenticator);
      await signOut();
    } catch (error) {
      //console.log('error signing out: ', error);
    }
  }

  const actions = [
    { name: "Delete All", icon: <BsTrash3Fill size={20} />, action: handleDeleteAll },
    { name: "Download PNG", icon: < PiFilePng size={25} />, action: handleDownloadPNG },
    { name: "Download JPG", icon: < PiFileJpg size={25} />, action: handleDownloadJPG },
    { name: "Delete Offense Formation", icon: <FlashOffIcon size={30} />, action: handleDeleteOffenseFormation },
    { name: "Delete Defense Formation", icon: <RemoveModeratorIcon />, action: handleDeleteDefenseFormation },
    { name: "Delete All Text Tags", icon: <FontDownloadOffIcon />, action: handleDeleteAllTextTags },
    { name: "Delete All Lines", icon: <AiOutlineDeleteColumn size={20} />, action: handleDeleteAllLines },
    { name: "Sign Out", icon: <LuLogOut size={25} />, action: handleSignOut },
  ];


  const handleMouseEnter = (index) => {
    const timeoutId = setTimeout(() => {
      setTooltipOpen(prevState => ({ ...prevState, [index]: true }));
    }, 400); // delay time
    setTooltipTimeoutId(timeoutId);
  };

  const handleMouseLeave = (index) => {
    clearTimeout(tooltipTimeoutId);
    const timeoutId = setTimeout(() => {
      setTooltipOpen(prevState => ({ ...prevState, [index]: false }));
    }, 300); // delay time
    setTooltipTimeoutId(timeoutId);
  };



  const openDialog = (title, text, action) => {
    //console.log("Open Dialog")
    setDialogTitle(title);
    setDialogText(text);
    setDialogAction(() => action);
    setDialogOpen(true);
  };

  useEffect(() => {
    checkIfDrawerEmpty()
  }, [])






  const list = (/**items, selectedItem, currentLayerData, setSnackbarMessage, setSnackbarSeverity, setOpenSnackbar, setItems, setTextTags,
  setShapes,
  setLines,
setCurrentLayerData, setSelectedItem, textTags, setSelectedTextTags,shapes,lines,backgroundImage,openDialog ,checkIfDrawerEmpty **/ ) => {
    const [open, setOpen] = React.useState(Array(items.length).fill(false)); // Maintain open state for each dropdown
    // //console.log("items in list==>", items)
    const anchorRef = React.useRef([]);
    const [selectedIndex, setSelectedIndex] = React.useState(-1); // Initialize selectedIndex
    useEffect(() => {
      if (open.length !== items.length) {
        setOpen(Array(items.length).fill(false))
      }
    }, [items])
    const handleOnClickAddPlay = () => {
      //console.log("Add Play Clicked");
      // handleClose()
      // setSelectedTextTags([]);
      openDialog('Add Play', '', (newPlayName) => {
        //console.log("open ");
        if (newPlayName !== null) {
          const itemExists = items?.some(item => item?.name === newPlayName);
          if (itemExists) {
            setSnackbarMessage('A play with this name already exists.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
          } else if (newPlayName === '') {
            setSnackbarMessage('Please enter a Play Name.');
            setSnackbarSeverity('warning');
            setOpenSnackbar(true);
          } else {
            const newItem = {
              id: uuidv4(),
              name: newPlayName,
              backgroundImage: backgroundImage,
              textTagList: [],
              shapeList: [],
              lineList: [],
              //drawingLine: (startPos && endPos)
            };
            setItems((prevItems) => [...prevItems, newItem]);
            setTextTags(newItem?.textTagList);
            setShapes(newItem?.shapeList);
            setLines(newItem?.lineList);
            setCurrentLayerData(newItem);
            // setSelectedItem(newItem.id);
            setSnackbarMessage('Play Added Successfully.');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
          }
        }
      });
    }



    const handleItemClick = (text) => {
      // //console.log('IM HERE', text);
      setSelectedItem(text?.id);

      const playName = text.name;

      const item = items.find(item => item.name === playName);
      const layerData = _.cloneDeep(item);
      if (layerData?.id != currentLayerData.id) {
        setTextTags(layerData.textTagList);
        setShapes(layerData.shapeList);
        setLines(layerData.lineList);
        setCurrentLayerData(layerData);
      }
    };
    const removeItem = (index) => {
      if (items.length > 1) {
        setItems(items.filter((item, i) => i !== index));
        checkIfDrawerEmpty();
        setSnackbarMessage('Play Removed.');
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
      } else {
        setSnackbarMessage('Play can not be Removed.');
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
      }
    };

    const updateItem = (index) => {
      setSelectedTextTags([]);
      openDialog('Update Play', items[index]?.name, (updatedName) => {
        if (updatedName !== null) {
          const itemExists = items.some((item, i) => item.name === updatedName && i !== index);
          if (itemExists) {
            setSnackbarMessage('A play with this name already exists.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
          } else if (updatedName === '') {
            setSnackbarMessage('Please enter a name for the play.');
            setSnackbarSeverity('warning');
            setOpenSnackbar(true);
          } else {
            const deepCopyTextTags = _.cloneDeep(textTags).map(tag => ({ ...tag, id: uuidv4() }));

            let shapeIdMapping = {};
            const deepCopyShapes = _.cloneDeep(shapes).map(shape => {
              const newId = uuidv4();
              shapeIdMapping[shape.id] = newId;
              return { ...shape, id: newId };
            });

            let lineIdMapping = {};
            const deepCopyLines = _.cloneDeep(lines).map(line => {
              const newId = uuidv4();
              lineIdMapping[line.id] = newId;
              return { ...line, id: newId, attachedShapeId: shapeIdMapping[line.attachedShapeId] };
            });
            const deepCopyLinesAgain = _.cloneDeep(deepCopyLines).map(line => {
              return { ...line, drawnFromId: lineIdMapping[line.drawnFromId] || line.drawnFromId };
            });

            const updatedItem = {
              ...items[index],
              name: updatedName,
              textTagList: deepCopyTextTags,
              shapeList: deepCopyShapes,
              lineList: deepCopyLinesAgain,
            };

            setItems((prevItems) => prevItems.map((item, i) => i === index ? updatedItem : item));
            setTextTags(updatedItem.textTagList);
            setShapes(updatedItem.shapeList);
            setLines(updatedItem.lineList);
            setCurrentLayerData(updatedItem);
            setSelectedItem(updatedItem.id);
            setSnackbarMessage('Play Updated Successfully.');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
          }
        }
      });
    };




    const saveItem = (index) => {

      const updatedItem = {
        ...items[index],
        textTagList: textTags,
        shapeList: shapes,
        lineList: lines,
      };

      // //console.log(index, "Index in items", items[index], "Current Layer Data", updatedItem)
      setItems((prevItems) => prevItems.map((item, i) => i === index ? updatedItem : item));
      setSelectedItem(updatedItem.id);
      setSnackbarMessage('Play Saved Successfully.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

    }
    const duplicateItem = (text) => {

      const newPlayName = currentLayerData.name + ' (duplicated)';

      // Create a duplicate of shapes and lines
      const duplicatedShapes = _.cloneDeep(shapes);
      const duplicatedLines = _.cloneDeep(lines);
      const newItem = {
        id: uuidv4(),
        name: newPlayName,
        backgroundImage: currentLayerData.backgroundImage,
        textTagList: currentLayerData.textTagList,
        shapeList: duplicatedShapes,
        lineList: duplicatedLines,
      };
      //console.log("in Duplicate ", items)
      setItems((prevItems) => [...prevItems, newItem]);
      setTextTags(newItem?.textTagList);
      setShapes(newItem?.shapeList);
      setLines(newItem?.lineList);
      // setCurrentLayerData(newItem);
      // setSelectedItem(newItem.id);
      setSnackbarMessage('Play Duplicated Successfully.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      // handleClose();

    }







    const handleMenuItemClick = (event, idx, text, option, index) => {
      setSelectedIndex(idx); // Update selectedIndex
      //console.log("Text==>", open, index)
      // handleToggle(index)
      handleClose(index)
      // handleClose(index);
      switch (option) {
        case 'Rename': {
          //console.log("Rename at index ", index, text)
          updateItem(index);
          // 

          break;
        }
        case 'Delete': {
          //console.log("Delete at index ", index, text)
          removeItem(index);
          // handleClose();

          break;
        }
        case 'Save': {
          saveItem(index, text.name);

          break;
        }
        case 'Duplicate':
          {
            duplicateItem(text);
            break;
          }
        default:
          break;
      }




    };


    const handleToggle = (index) => {
      setOpen((prevOpen) => {
        const newOpen = [...prevOpen];
        newOpen[index] = !newOpen[index];
        if (newOpen[index]) {
          // Reset selectedIndex when the menu opens
          setSelectedIndex(-1);
        }
        return newOpen;
      });
    };


    const handleClose = useCallback((index) => {
      // //console.log("Handle Close", index)
      // return;
      const closeAll = open.map(i => false)
      //console.log(closeAll)
      setTimeout(() => {

        setOpen(closeAll)
      }, 1000);
      // setOpen(prevOpen => {
      //   if (index === undefined) {
      //     // If index is undefined, set all elements to false
      //     //console.log("Prev Open", Array(items.length).fill(false))

      //     return [false];
      //   } else {
      //     const newOpen = [...prevOpen];
      //     newOpen[index] = false;
      //     return newOpen;
      //   }
      // });
    }, []);

    return (
      <div style={{ backgroundColor: '#333333', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', flex: 1, alignItems: 'center', position: 'absolute', bottom: 0, width: '80%', borderTop: 'solid #D9F0F9', borderWidth: '0.5px' }}>
        <div
          onClick={(event) => {
            handleOnClickAddPlay()
          }}
          //  className='onhover'
          key={"click"}
          style={{ width: '100px' }}

        >
          <IconButton
            key={"icon"}
          >
            <AddIcon style={{ width: "16px", height: "18px", color: '#D9F0F9' }}
              key={"iconAdd"}
            />
          </IconButton>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #D9F0F9', borderRight: 'medium solid #D9F0F9', borderWidth: '1px' }}>
          {items.map((text, index) => {
            return (
              <div className={`onhover ${selectedItem == text.id && 'backgroundColor'}`} style={{ padding: "5px 6px", borderRight: 'medium solid #D9F0F9', borderWidth: '1px', cursor: 'pointer' }}
                onClick={() => {
                  handleToggle(index)
                  handleItemClick(text)
                }}
              >
                <div size="small"
                  // onClick={() => {
                  //   handleItemClick(text)
                  //   handleToggle(index)
                  // }}
                  onClick={() => {
                    handleItemClick(text)
                    handleToggle(index)
                  }}
                  style={{ fontSize: "13px", fontWeight: "400", display: "flex", justifyContent: "center", alignItems: "center", marginInline: "14px", color: '#D9F0F9' }}>
                  {text?.name}
                  <div ref={(el) => anchorRef.current[index] = el} onClick={() => {
                    handleItemClick(text)
                    handleToggle(index)
                  }}>
                    <ArrowDropDownIcon style={{ marginTop: '4px', color: '#D9F0F9', transform: open[index] ? 'rotate(180deg)' : null, marginLeft: '10px' }} />
                  </div>
                </div>
                <Popper sx={{ zIndex: 1 }} open={open[index] ?? false} anchorEl={anchorRef.current[index]} role={undefined} transition disablePortal>
                  {({ TransitionProps, placement }) => (
                    <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                      <Paper>
                        <ClickAwayListener onClickAway={(event) => handleClose(index)}>
                          <MenuList id="split-button-menu" autoFocusItem>
                            {options.map((option, idx) => (
                              <MenuItem key={option} selected={idx === selectedIndex} onClick={(event) => handleMenuItemClick(event, idx, text, option, index)}>
                                {option}
                              </MenuItem>
                            ))}
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              </div>
            )
          })}
        </div>
      </div>
    );
  };


  return (
    <>
      {/* <button onClick={() => { signOut(); setCurrentUser(null); setShowAuthenticator(!showAuthenticator) }}>Sign out</button> */}
      {/* <div id="signInDiv"></div> */}
      <ThemeProvider theme={theme}>
        <StageDimensionsContext.Provider value={{ stageDimensions }}>
          <>
            {/* <Button onClick={(e) => handleSignOut(e)}>Sign Out</Button> */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '0vw',
              padding: '0vw',
              height: '100vh',
              width: '100vw',
            }}>
              <div className="custom-scrollbar">
                <Stencil
                  shapes={shapes}
                  setShapes={setShapes}
                  textTags={textTags}
                  setTextTags={setTextTags}
                  setSelectedTextTags={setSelectedTextTags}
                  currentLayerData={currentLayerData}
                  setCurrentLayerData={setCurrentLayerData}
                  onAddFormation={addFormation}
                  onAddShape={addShape}
                  onAddTextTag={addTextTag}
                  fieldType={fieldType}
                  setFieldType={setFieldType}
                  setZone={setZone}
                  zone={zone}
                  setRedLine={setRedLine}
                  redLine={redLine}
                  onDeleteAllShapes={deleteAllShapes}
                  onChangeFormation={deleteFormation} //deletes all other formation shapes except one chosen
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                  selectedLineStroke={selectedLineStroke}
                  setSelectedLineStroke={setSelectedLineStroke}
                  selectedLineEnd={selectedLineEnd}
                  setSelectedLineEnd={setSelectedLineEnd}
                  onDeleteAllTextTags={deleteAllTextTags}
                  onDeleteAllLines={deleteAllLines}
                  setColorButtonPressCount={setColorButtonPressCount}
                  setStrokeTypeButtonPressCount={setStrokeTypeButtonPressCount}
                  setStrokeEndButtonPressCount={setStrokeEndButtonPressCount}
                  selectedColorButton={selectedColorButton}
                  setSelectedColorButton={setSelectedColorButton}
                  stageRef={stageRef}
                  flipAllTextTags={flipAllTextTags}
                  flipAllShapes={flipAllShapes}
                  backgroundImage={backgroundImage}
                  lines={lines}
                  setLines={setLines}
                  items={items}
                  setItems={setItems}
                  dialogOpen={dialogOpen}
                  setDialogOpen={setDialogOpen}
                  dialogTitle={dialogTitle}
                  setDialogTitle={setDialogTitle}
                  dialogText={dialogText}
                  setDialogText={setDialogText}
                  dialogAction={dialogAction}
                  setDialogAction={setDialogAction}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  openSnackbar={openSnackbar}
                  setOpenSnackbar={setOpenSnackbar}
                  snackbarMessage={snackbarMessage}
                  setSnackbarMessage={setSnackbarMessage}
                  snackbarSeverity={snackbarSeverity}
                  setSnackbarSeverity={setSnackbarSeverity}
                  openDialog={openDialog}
                />
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1.8,
                padding: '1vw',
                maxWidth: 'calc(80%)',
                marginRight: '0vw',
                borderTop: '1px solid black',
                borderRight: '1px solid black',
                borderBottom: '1px solid black',
                height: '100%',
                backgroundColor: '#1e1e1e', // See parent div
              }}>
                <Canvas
                  imageRef={imageRef}
                  selectedLineID={selectedLineID}
                  setSelectedLineID={setSelectedLineID}
                  currentLayerData={currentLayerData}
                  setCurrentLayerData={setCurrentLayerData}
                  colorButtonPressCount={colorButtonPressCount}
                  strokeTypeButtonPressCount={strokeTypeButtonPressCount}
                  setStrokeTypeButtonPressCount={setStrokeTypeButtonPressCount}
                  strokeEndButtonPressCount={strokeEndButtonPressCount}
                  setStrokeEndButtonPressCount={setStrokeEndButtonPressCount}
                  selectedLineEnd={selectedLineEnd}
                  setSelectedLineEnd={setSelectedLineEnd}
                  lines={lines}
                  setShapes={setShapes}
                  setLines={setLines}
                  setSelectedColor={setSelectedColor}
                  startPos={startPos}
                  endPos={endPos}
                  startDrawing={startDrawing}
                  draw={draw}
                  stopDrawing={stopDrawing}
                  deleteAllLines={deleteAllLines}
                  selectedColorButton={selectedColorButton}
                  setSelectedColorButton={setSelectedColorButton}
                  onLineChange={updateLine}
                  onLineDelete={deleteLine}
                  shapes={shapes}
                  selectedShapes={selectedShapes}
                  setSelectedShapes={setSelectedShapes}
                  onShapeChange={updateShape}
                  onShapeDelete={deleteShape}
                  onHideContextMenu={hideShapeContextMenu}
                  textTags={textTags}
                  selectedTextTags={selectedTextTags}
                  setSelectedTextTags={setSelectedTextTags}
                  onTextTagChange={updateTextTag}
                  onTextTagDelete={deleteTextTag}
                  onHideTextTagContextMenu={hideTextTagContextMenu}
                  selectedColor={selectedColor}
                  selectedLineStroke={selectedLineStroke}
                  backgroundImage={backgroundImage}
                  setStageDimensions={setStageDimensions}
                  stageRef={stageRef}
                  waterMark={waterMark}
                  setWatermark={setWatermark}
                />
                {/* {list(items, selectedItem, currentLayerData, setSnackbarMessage, setSnackbarSeverity, setOpenSnackbar, setItems, setTextTags,
                  setShapes,
                  setLines,
                  setCurrentLayerData, setSelectedItem, textTags, setSelectedTextTags,shapes,lines,backgroundImage ,openDialog ,checkIfDrawerEmpty )} */}
                {list()}
                <SpeedDial
                  ariaLabel="SpeedDial"
                  icon={isSpeedDialOpen ? <CloseIcon sx={{ color: 'red' }} /> : <MoreVertIcon sx={{ color: 'black' }} />}
                  direction={'down'}
                  FabProps={{ size: 'small', color: 'white' }}
                  onClick={handleToggleSpeedDial}
                  open={isSpeedDialOpen}
                  sx={{ position: 'fixed', top: '20px', right: '40px', marginTop: '15px' }} // Update this line
                >
                  {actions.map((action, index) => (
                    <SpeedDialAction
                      key={`dial-${index}`}
                      icon={action.icon}
                      onClick={action.action}
                      tooltipTitle={tooltipOpen[index] ? action.name : ""}
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={() => handleMouseLeave(index)}
                    />
                  ))}
                </SpeedDial>
                <Dialog open={dialogOpen} onClose={closeDialog}>
                  <DialogTitle>{dialogTitle}</DialogTitle>
                  <DialogContent>
                    <TextField
                      autoFocus
                      margin="dense"
                      id="name"
                      label="Name"
                      type="text"
                      fullWidth
                      value={dialogText}
                      onChange={(event) => setDialogText(event.target.value)}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button onClick={handleDialogSubmit}>Submit</Button>
                  </DialogActions>
                </Dialog>
                <Snackbar open={openSnackbar} autoHideDuration={2000} onClose={handleCloseSnackbar}>
                  <MuiAlert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                  </MuiAlert>
                </Snackbar>
                {/* <SpeedDial
                  ariaLabel="AddPlay"
                  sx={{ position: 'fixed', bottom: '30px', right: '50px', marginTop: '15px' }}
                  icon={<IoIosAdd color='#2B76BA' style={{ fontSize: '30px' }} />}
                  FabProps={{ size: 'small', color: 'white' }}
                  onClick={handleOnClickAddPlay}
                /> */}
              </div>
            </div>
          </>
        </StageDimensionsContext.Provider>
      </ThemeProvider >
    </>
  );
}



// export const list = (items, selectedItem, currentLayerData, setSnackbarMessage, setSnackbarSeverity, setOpenSnackbar, setItems, setTextTags,
//   setShapes,
//   setLines,
//   setCurrentLayerData, setSelectedItem, textTags, setSelectedTextTags,shapes,lines,backgroundImage,openDialog ,checkIfDrawerEmpty  ) => {
//   // //console.log("items in list==>", items)
//   const [open, setOpen] = React.useState(Array(items.length).fill(false)); // Maintain open state for each dropdown
//   const anchorRef = React.useRef([]);
//   const [selectedIndex, setSelectedIndex] = React.useState(-1); // Initialize selectedIndex
//   const handleOnClickAddPlay = () => {
//     //console.log("Add Play Clicked");
//     // handleClose()
//     // setSelectedTextTags([]);
//     openDialog('Add Play', '', (newPlayName) => {
//       //console.log("open ");
//       if (newPlayName !== null) {
//         const itemExists = items?.some(item => item?.name === newPlayName);
//         if (itemExists) {
//           setSnackbarMessage('A play with this name already exists.');
//           setSnackbarSeverity('error');
//           setOpenSnackbar(true);
//         } else if (newPlayName === '') {
//           setSnackbarMessage('Please enter a Play Name.');
//           setSnackbarSeverity('warning');
//           setOpenSnackbar(true);
//         } else {

//           // const deepCopyTextTags = _.cloneDeep(textTags).map(tag => ({ ...tag, id: uuidv4() }));

//           // let shapeIdMapping = {};
//           // const deepCopyShapes = _.cloneDeep(shapes).map(shape => {
//           //   const newId = uuidv4();
//           //   shapeIdMapping[shape.id] = newId;
//           //   return { ...shape, id: newId };
//           // });

//           // let lineIdMapping = {};
//           // //Mapping of old line IDs to new line IDs
//           // const deepCopyLines = _.cloneDeep(lines).map(line => {
//           //   const newId = uuidv4();
//           //   lineIdMapping[line.id] = newId;
//           //   return {
//           //     ...line,
//           //     id: newId,
//           //     attachedShapeId: shapeIdMapping[line?.attachedShapeId],
//           //   };
//           // });
//           // //update drawnFromId to new line IDs
//           // const deepCopyLinesAgain = _.cloneDeep(deepCopyLines).map(line => {
//           //   return {
//           //     ...line,
//           //     drawnFromId: line.attachedShapeId || lineIdMapping[line.drawnFromId] || line.drawnFromId
//           //   };
//           // });

//           // //console.log('Adding play:', newPlayName);
//           // //console.log('||', newPlayName, 'Text Tags:', deepCopyTextTags);
//           // //console.log('||', newPlayName, 'Shapes:', deepCopyShapes);
//           // //console.log('||', newPlayName, 'Lines:', deepCopyLines);
//           const newItem = {
//             id: uuidv4(),
//             name: newPlayName,
//             backgroundImage: backgroundImage,
//             textTagList: [],
//             shapeList: [],
//             lineList: [],
//             //drawingLine: (startPos && endPos)
//           };
//           setItems((prevItems) => [...prevItems, newItem]);
//           setTextTags(newItem?.textTagList);
//           setShapes(newItem?.shapeList);
//           setLines(newItem?.lineList);
//           setCurrentLayerData(newItem);
//           setSelectedItem(newItem.id);
//           setSnackbarMessage('Play Added Successfully.');
//           setSnackbarSeverity('success');
//           setOpenSnackbar(true);
//         }
//       }
//     });
//   }




//   const handleItemClick = (text) => {
//     ////console.log('IM HERE', text);
//     const playName = text.name;
//     //Pass playName to a function that can render
//     //the stage with that playName as the ID
//     //console.log('Rendering play:', playName);
//     //console.log(currentLayerData);

//     //Extract the items list and find the item with playName associated
//     const item = items.find(item => item.name === playName);

//     //Create DEEP COPY of the item in layerData
//     const layerData = _.cloneDeep(item);
//     //console.log(layerData)
//     if (layerData?.id != currentLayerData.id) {
//       setTextTags(layerData.textTagList);
//       setShapes(layerData.shapeList);
//       setLines(layerData.lineList);
//       setCurrentLayerData(layerData);
//       setSelectedItem(text.id);
//     }
//   };
//   const removeItem = (index) => {
//     if (items.length > 1) {
//       setItems(items.filter((item, i) => i !== index));
//       checkIfDrawerEmpty();
//       setSnackbarMessage('Play Removed.');
//       setSnackbarSeverity('warning');
//       setOpenSnackbar(true);
//     } else {
//       setSnackbarMessage('Play can not be Removed.');
//       setSnackbarSeverity('warning');
//       setOpenSnackbar(true);
//     }
//   };

//   const updateItem = (index) => {
//     setSelectedTextTags([]);
//     openDialog('Update Play', items[index]?.name, (updatedName) => {
//       if (updatedName !== null) {
//         const itemExists = items.some((item, i) => item.name === updatedName && i !== index);
//         if (itemExists) {
//           setSnackbarMessage('A play with this name already exists.');
//           setSnackbarSeverity('error');
//           setOpenSnackbar(true);
//         } else if (updatedName === '') {
//           setSnackbarMessage('Please enter a name for the play.');
//           setSnackbarSeverity('warning');
//           setOpenSnackbar(true);
//         } else {
//           const deepCopyTextTags = _.cloneDeep(textTags).map(tag => ({ ...tag, id: uuidv4() }));

//           let shapeIdMapping = {};
//           const deepCopyShapes = _.cloneDeep(shapes).map(shape => {
//             const newId = uuidv4();
//             shapeIdMapping[shape.id] = newId;
//             return { ...shape, id: newId };
//           });

//           let lineIdMapping = {};
//           const deepCopyLines = _.cloneDeep(lines).map(line => {
//             const newId = uuidv4();
//             lineIdMapping[line.id] = newId;
//             return { ...line, id: newId, attachedShapeId: shapeIdMapping[line.attachedShapeId] };
//           });
//           const deepCopyLinesAgain = _.cloneDeep(deepCopyLines).map(line => {
//             return { ...line, drawnFromId: lineIdMapping[line.drawnFromId] || line.drawnFromId };
//           });

//           const updatedItem = {
//             ...items[index],
//             name: updatedName,
//             textTagList: deepCopyTextTags,
//             shapeList: deepCopyShapes,
//             lineList: deepCopyLinesAgain,
//           };

//           setItems((prevItems) => prevItems.map((item, i) => i === index ? updatedItem : item));
//           setTextTags(updatedItem.textTagList);
//           setShapes(updatedItem.shapeList);
//           setLines(updatedItem.lineList);
//           setCurrentLayerData(updatedItem);
//           setSelectedItem(updatedItem.id);
//           setSnackbarMessage('Play Updated Successfully.');
//           setSnackbarSeverity('success');
//           setOpenSnackbar(true);
//         }
//       }
//     });
//   };




//   const saveItem = (index) => {

//     const updatedItem = {
//       ...items[index],
//       textTagList: textTags,
//       shapeList: shapes,
//       lineList: lines,
//     };

//     //console.log(index, "Index in items", items[index], "Current Layer Data", updatedItem)
//     setItems((prevItems) => prevItems.map((item, i) => i === index ? updatedItem : item));
//     setSelectedItem(updatedItem.id);
//     setSnackbarMessage('Play Saved Successfully.');
//     setSnackbarSeverity('success');
//     setOpenSnackbar(true);

//   }
//   const duplicateItem = (duplicatePlayName) => {
//     var newPlayName = duplicatePlayName;
//     const itemExists = items?.some(item => item?.name === newPlayName);
//     if (itemExists) {
//       newPlayName = duplicatePlayName + '(duplicated)'
//     }
//     const deepCopyTextTags = _.cloneDeep(textTags).map(tag => ({ ...tag, id: uuidv4() }));

//     let shapeIdMapping = {};
//     const deepCopyShapes = _.cloneDeep(shapes).map(shape => {
//       const newId = uuidv4();
//       shapeIdMapping[shape.id] = newId;
//       return { ...shape, id: newId };
//     });

//     let lineIdMapping = {};
//     //Mapping of old line IDs to new line IDs
//     const deepCopyLines = _.cloneDeep(lines).map(line => {
//       const newId = uuidv4();
//       lineIdMapping[line.id] = newId;
//       return {
//         ...line,
//         id: newId,
//         attachedShapeId: shapeIdMapping[line?.attachedShapeId],
//       };
//     });
//     //update drawnFromId to new line IDs
//     const deepCopyLinesAgain = _.cloneDeep(deepCopyLines).map(line => {
//       return {
//         ...line,
//         drawnFromId: line.attachedShapeId || lineIdMapping[line.drawnFromId] || line.drawnFromId
//       };
//     });

//     //console.log('Adding play:', newPlayName);
//     //console.log('||', newPlayName, 'Text Tags:', deepCopyTextTags);
//     //console.log('||', newPlayName, 'Shapes:', deepCopyShapes);
//     //console.log('||', newPlayName, 'Lines:', deepCopyLines);
//     const newItem = {
//       id: uuidv4(),
//       name: newPlayName,
//       backgroundImage: backgroundImage,
//       textTagList: deepCopyTextTags,
//       shapeList: deepCopyShapes,
//       lineList: deepCopyLinesAgain,
//       //drawingLine: (startPos && endPos)
//     };
//     setItems((prevItems) => [...prevItems, newItem]);
//     setTextTags(newItem?.textTagList);
//     setShapes(newItem?.shapeList);
//     setLines(newItem?.lineList);
//     setCurrentLayerData(newItem);
//     setSelectedItem(newItem.id);
//     setSnackbarMessage('Play Duplicated Successfully.');
//     setSnackbarSeverity('success');
//     setOpenSnackbar(true);

//   }

//   const handleMenuItemClick = (event, idx, text, option, index) => {
//     setSelectedIndex(idx); // Update selectedIndex
//     //console.log("Text==>", option)

//     switch (option) {
//       case 'Rename':
//         //console.log("Rename at index ", index, text)
//         updateItem(index)
//         handleClose()

//         break;
//       case 'Delete':
//         //console.log("Delete at index ", index, text)
//         removeItem(index)
//         handleClose()
//         break;
//       case 'Save':
//         saveItem(index, text.name)

//         break;
//       case 'Duplicate':
//         duplicateItem(text.name)
//         handleClose()

//         break;
//       default:
//         break;
//     }




//   };

//   const handleToggle = (index) => { // Update open state for the clicked dropdown
//     setOpen(prevOpen => {
//       const newOpen = prevOpen.length ? [...prevOpen] : prevOpen;
//       newOpen[index] = !newOpen[index];
//       return newOpen;
//     });
//   };

//   const handleClose = (event, index) => {
//     setOpen(prevOpen => {
//       if (index === undefined) {
//         // If index is undefined, set all elements to false
//         return Array(prevOpen.length).fill(false);
//       } else {
//         const newOpen = [...prevOpen];
//         newOpen[index] = false;
//         return newOpen;
//       }
//     });
//   };

//   return (
//     <div style={{ backgroundColor: '#333333', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', flex: 1, alignItems: 'center', position: 'absolute', bottom: 0, width: '80%', borderTop: 'solid #D9F0F9', borderWidth: '0.5px' }}>
//       <div
//         onClick={(event) => {
//           handleOnClickAddPlay()
//         }}
//         //  className='onhover'
//         style={{ width: '100px' }}

//       >
//         <IconButton
//         >
//           <AddIcon style={{ width: "16px", height: "18px", color: '#D9F0F9' }} />
//         </IconButton>
//       </div>
//       <div style={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #D9F0F9', borderRight: 'medium solid #D9F0F9', borderWidth: '1px' }}>
//         {items.map((text, index) => {
//           return (
//             <div className={`onhover ${selectedItem == text.id && 'backgroundColor'}`} style={{ padding: "5px 6px", borderRight: 'medium solid #D9F0F9', borderWidth: '1px', cursor: 'pointer' }}
//               onClick={() => {
//                 handleItemClick(text)
//                 handleToggle(index)
//               }}
//             >
//               <div size="small"
//                 // onClick={() => {
//                 //   handleItemClick(text)
//                 //   handleToggle(index)
//                 // }}
//                 onClick={() => {
//                   handleItemClick(text)
//                   handleToggle(index)
//                 }}
//                 style={{ fontSize: "13px", fontWeight: "400", display: "flex", justifyContent: "center", alignItems: "center", marginInline: "14px", color: '#D9F0F9' }}>
//                 {text?.name}
//                 <div ref={(el) => anchorRef.current[index] = el} onClick={() => {
//                   handleItemClick(text)
//                   handleToggle(index)
//                 }}>
//                   <ArrowDropDownIcon style={{ marginTop: '4px', color: '#D9F0F9', transform: open[index] ? 'rotate(180deg)' : null, marginLeft: '10px' }} />
//                 </div>
//               </div>
//               <Popper sx={{ zIndex: 1 }} open={open[index]} anchorEl={anchorRef.current[index]} role={undefined} transition disablePortal>
//                 {({ TransitionProps, placement }) => (
//                   <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
//                     <Paper>
//                       <ClickAwayListener onClickAway={(event) => handleClose(event, index)}>
//                         <MenuList id="split-button-menu" autoFocusItem>
//                           {options.map((option, idx) => (
//                             <MenuItem key={option} selected={idx === selectedIndex} onClick={(event) => handleMenuItemClick(event, idx, text, option, index)}>
//                               {option}
//                             </MenuItem>
//                           ))}
//                         </MenuList>
//                       </ClickAwayListener>
//                     </Paper>
//                   </Grow>
//                 )}
//               </Popper>
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   );
// };
export default App;
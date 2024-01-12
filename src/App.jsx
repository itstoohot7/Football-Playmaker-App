// App.jsx
import React, { useState, useRef, useEffect } from 'react';
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
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import RemoveModeratorIcon from '@mui/icons-material/RemoveModerator';
import { GiZeusSword } from "react-icons/gi";
import { SiJpeg } from "react-icons/si";
import { PiFilePng } from "react-icons/pi";
import { LuLogOut } from "react-icons/lu";
import './App.css';
import useLines from './hooks/useLines';
import { set } from 'lodash';
import { jwtDecode } from "jwt-decode";
import { Button, } from '@mui/material';


import { v4 as uuidv4 } from 'uuid';
////////////////////////////////////////////////////////////////////////////////////////
/*
TODO: undo/redo
TOOD: orientation
*/
////////////////////////////////////////////////////////////////////////////////////////
function App() {
  const undo = useRef({index: 0, values: []});

  //FIXME: manage user objects in database with permissions attached
  // this is ok for now, but not secure.
  const [user, setUser] = useState(null);

  function handleCallbackResponse(response) {
    //console.log("Encoded JWT ID token: " + response.credential);
    var userObject = jwtDecode(response.credential);
    console.log(userObject);
    setUser(userObject);
    document.getElementById("signInDiv").hidden = true;

    //console.log(userObject);
    // const email = userObject.email;
    // //FIXME: DUMMY LOGIC FOR WHITELIST TESTING
    // const testUsers = ['test1@example.com', 'test2@example.com', 'max.chalitsios@gmail.com'];

    // if (!testUsers.includes(email)) {
    //   handleSignOut();
    //   console.log('Not whitelisted');
    // } else {
    //   setUser(userObject);
    //   document.getElementById("signInDiv").hidden = true;
    // }
  }

  function handleSignOut(event) {
    /* global google */
    setUser(null);
    document.getElementById("signInDiv").hidden = false;
    //window.location.href = 'https://accounts.google.com/Logout';
    google.accounts.id.disableAutoSelect();
    //handleCancel();
  }

  // function handleCancel() {
  //   const signInDiv = document.getElementById('signInDiv');
  //   signInDiv.innerHTML = 'Not whitelisted';
  // }

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: "473768208195-c18kgorq5k8rr6qkub9ck9k4lbk96ol3.apps.googleusercontent.com",
      callback: handleCallbackResponse, //if someone logs in
      cancel_on_tap_outside: true,
      //prompt_parent_id: 'signInDiv', //option to display the sign-in prompt within a specific HTML element.
    })

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large", text: "continue_with" }
    );
    //google.accounts.id.prompt();
  }, []);

  // If !user: sign in button
  // If user: log out button

  const imageRef = useRef(null);
  const stageRef = useRef(null);
  const [colorButtonPressCount, setColorButtonPressCount] = useState(0);
  const [strokeTypeButtonPressCount, setStrokeTypeButtonPressCount] = useState(0);
  const [strokeEndButtonPressCount, setStrokeEndButtonPressCount] = useState(0);
  const [selectedShapes, setSelectedShapes] = useState([]); //This is for Selection Rectangle
  const [selectedTextTags, setSelectedTextTags] = useState([]);
  const [selectedColor, setSelectedColor] = useState(theme.palette.pitchBlack.main); //default color
  const [selectedLineStroke, setSelectedLineStroke] = useState('straight'); // default straight line
  const [selectedLineEnd, setSelectedLineEnd] = useState('straight'); // default arrow line end
  const [stageDimensions, setStageDimensions] = useState({ width: 0, height: 0 });
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [currentLayerData, setCurrentLayerData] = useState(null);
  const { backgroundImage, fieldType, setFieldType, setZone, zone, setRedLine, redLine } = useBackground();
  const { shapes, setShapes, addFormation, addShape, updateShape, deleteShape, deleteFormation, deleteAllShapes, hideShapeContextMenu, flipAllShapes } = useShapes(imageRef);
  const { textTags, setTextTags, addTextTag, updateTextTag, deleteTextTag, deleteAllTextTags, hideTextTagContextMenu, flipAllTextTags } = useTextTags(imageRef);
  const { lines, startPos, endPos, startDrawing, draw, stopDrawing, deleteAllLines, setLines, deleteLine, updateLine } = useLines(imageRef);

  const handleDownloadPNG = () => {
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
  };

  const handleDownloadJPEG = () => {
    var dataURL = stageRef.current.toDataURL({ pixelRatio: 3, mimeType: "image/jpeg" });
    var link = document.createElement('a');
    if (currentLayerData === null) {
      link.download = 'untitled.jpeg';
    } else {
      link.download = `${currentLayerData.name}.jpeg`
    }
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const logHistory = (values) =>{
    for(var i =1; i< undo.current.index; i++)
            undo.current.values.pop();
      undo.current.index = 1;
      undo.current.values.push(values);
  }

  const preformUndo = (index) => {
    console.log(undo.current.values);
    if(undo.current.values[index].type === "shape"){
      undoShape(index);
    }else {
      undoText(index);
    }
  }

  const undoText = (index) => {
    const text = undo.current.values[index].state;
    text.key = uuidv4();
    updateTextTag(text.id, text);
  }

  const undoShape = (index) => {
    const newShape = undo.current.values[index].state;
    newShape.key = uuidv4();
    updateShape(undo.current.values[index].id, newShape);
  }

  
  const handleUndo = () => {
    if(undo.current.index >= undo.current.values.length){
      return;
    }
    const index = undo.current.values.length-1-undo.current.index;
    preformUndo(index);
    undo.current.index += 1;
  }

  

  const handleRedo = () => {
    if(undo.current.index <= 1) {
      return;
    }
    const index = undo.current.values.length+1-undo.current.index;
    preformUndo(index);
    undo.current.index -= 1;
  }

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

  const handleToggleSpeedDial = () => {
    setIsSpeedDialOpen(!isSpeedDialOpen);
  };


  const actions = [
    { icon: <DeleteForeverOutlinedIcon fontSize='large' />, action: handleDeleteAll },
    { icon: <GiZeusSword size={30} />, action: handleDeleteOffenseFormation },
    { icon: <RemoveModeratorIcon fontSize='medium' />, action: handleDeleteDefenseFormation },
    { icon: < PiFilePng size={30} />, action: handleDownloadPNG },
    { icon: <SiJpeg size={25} />, action: handleDownloadJPEG },
    { icon: <LuLogOut size={25} />, action: handleSignOut },
  ];

  return (
    <>
      <div id="signInDiv"></div>
      <ThemeProvider theme={theme}>
        <StageDimensionsContext.Provider value={{ stageDimensions }}>
          {user && (<>
            {/* <Button onClick={(e) => handleSignOut(e)}>Sign Out</Button> */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '1vw',
              height: '90vh',
              width: '98vw',
            }}>
              <div className="custom-scrollbar">
                <Stencil
                  logHistory={logHistory}
                  handleUndo={handleUndo}
                  handleRedo={handleRedo}
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
                  stageRef={stageRef}
                  flipAllTextTags={flipAllTextTags}
                  flipAllShapes={flipAllShapes}
                  backgroundImage={backgroundImage}
                  lines={lines}
                  setLines={setLines}
                />
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1.8,
                padding: '1vw',
                maxWidth: 'calc(80% - 4vw)',
                marginRight: '2vw',
                borderTop: '1px solid black',
                borderRight: '1px solid black',
                borderBottom: '1px solid black',
                height: '100%',
                backgroundColor: '#dcdcdc', // See parent div
              }}>
                <Canvas
                  logHistory={logHistory}
                  imageRef={imageRef}
                  currentLayerData={currentLayerData}
                  setCurrentLayerData={setCurrentLayerData}
                  colorButtonPressCount={colorButtonPressCount}
                  strokeTypeButtonPressCount={strokeTypeButtonPressCount}
                  strokeEndButtonPressCount={strokeEndButtonPressCount}
                  lines={lines}
                  setLines={setLines}
                  startPos={startPos}
                  endPos={endPos}
                  startDrawing={startDrawing}
                  draw={draw}
                  stopDrawing={stopDrawing}
                  deleteAllLines={deleteAllLines}
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
                  selectedLineEnd={selectedLineEnd}
                  backgroundImage={backgroundImage}
                  setStageDimensions={setStageDimensions}
                  stageRef={stageRef}
                />
                <SpeedDial
                  ariaLabel="SpeedDial"
                  icon={isSpeedDialOpen ? <CloseIcon sx={{ color: 'red' }} /> : <MoreVertIcon sx={{ color: 'black' }} />}
                  direction={'down'}
                  FabProps={{ size: 'small', color: 'white' }}
                  onClick={handleToggleSpeedDial}
                  open={isSpeedDialOpen}
                  sx={{ position: 'fixed', top: '20px', right: '15px', marginTop: '15px', marginRight: '2.5vw' }} // Update this line
                >
                  {actions.map((action, index) => (
                    <SpeedDialAction
                      key={`dial-${index}`}
                      icon={action.icon}
                      onClick={action.action}
                    />
                  ))}
                </SpeedDial>
              </div>
            </div>
          </>)}
        </StageDimensionsContext.Provider>
      </ThemeProvider>
    </>
  );
}
export default App;
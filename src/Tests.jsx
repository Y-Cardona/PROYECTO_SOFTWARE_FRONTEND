/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import "./App.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import Modal from "./components/Modal";
import matriz from "./images/Matrix.jpeg";
import getCoordinates from "./api/endpoints/getTest";
import registerTestResult from "./api/endpoints/registerTestResult";

const Tests = () => {
  let navigate = useNavigate();
  const [ordersa, setOrdersa] = useState([]);
  const [positionTop, setPositionTop] = useState(0);
  const [positionLeft, setPositionLeft] = useState(0);
  const [startTest, setStartTest] = useState();
  const [anserwesSent, setAnserwesSent] = useState(false);
  const [showTrace, setShowTrace] = useState();
  let modifier = 41.5;
  let modifierSide = 45;
  const block = document.getElementById("block");
  const [displayArray, setDisplayArray] = useState([]);
  const [displayEl, setDisplayEl] = useState();
  const [alert, setAlert] = useState({ show: false, Title: "", message: "" });
  const [currentTest, setCurrentTest] = useState(1);
  let instructionsList = document.querySelector(".ordersView");
  let { id } = useParams();
  const [test, setTest] = useState({});
  const [blockRoute, setBlockRoute] = useState([]);
  let codigo = localStorage.getItem("codigo")

  useEffect(() => {
    getCoordinates(id)
      .then(function (response) {
        if (response) {
          let data = response[0];
          setTest({
            startPostion: { top: data[1], left: data[0] },
            goalPosition: { top: data[3], left: data[2] },
          });
        }
      })
      .catch(function (error) {
      });
  }, [id]);

  const { goalPosition, startPostion } = test || {};

  const handleDirectionClick = (e) => {
    if (startTest && !anserwesSent) {
      instructionsList.innerHTML += e.target.name + "\n";
      setOrdersa((oldArray) => [...ordersa, e.target.name]);
      const { style } = block;

      switch (e.target.name) {
        case "arriba":
          if (`${parseInt(style.top) + modifier}` >= 214.5) {
            style.top = `${parseInt(style.top) - modifier}px`;
          } else {
            setAlert({
              show: true,
              title: "CUIDADO",
              message: "Estas en el borde",
            });

          }
          break;
        case "abajo":
          if (`${parseInt(style.top) + modifier}` <= 433) {
            style.top = `${parseInt(style.top) + modifier}px`;
          } else {
            setAlert({
              show: true,
              title: "CUIDADO",
              message: "Estas en el borde",
            });
          }
          break;
        case "izquierda":
          if (`${parseInt(style.left) + modifierSide}` >= 317) {
            style.left = `${parseInt(style.left) - modifierSide}px`;
          } else {
            //alert("Te saliste");
            setAlert({
              show: true,
              title: "CUIDADO",
              message: "Estas en el borde",
            });
          }

          break;
        case "derecha":
          if (`${parseInt(style.left) + modifierSide}` <= 497) {
            style.left = `${parseInt(style.left) + modifierSide}px`;
          } else {
            //alert("Te saliste");
            setAlert({
              show: true,
              title: "CUIDADO",
              message: "Estas en el borde",
            });
          }

          break;
        default:
          break;
      }
      setPositionTop(style.top);
      setPositionLeft(style.left);
      setBlockRoute(blockRoute.concat({ top: style.top, left: style.left }));
    } else {
      return;
    }
  };

  const handleStartTest = (e) => {
    let canvasObject = document.createElement("CANVAS");
    let canvasBg = document.querySelector(".imgBg");
    let containerTestView = document.querySelector(".testView");
    let ctx = canvasObject.getContext("2d");
    setStartTest(true);

    ctx.canvas.width = 330;
    ctx.canvas.height = 300;
    ctx.drawImage(canvasBg, 0, 0);
    containerTestView.appendChild(canvasObject);
    document.getElementById("start").style.display = "flex";
    document.getElementById("goal").style.display = "flex";
    handleDirectionClick(e);
  };

  const handleNextTest = () => {
    setStartTest(false);
    setAnserwesSent(false);
    let container = document.querySelector(".testView");
    var child = container.firstElementChild;
    container.removeChild(child);
    setBlockRoute([]);
    setDisplayArray([]);
    setShowTrace(false);
    block.style.display = "none";
    document.getElementById("start").style.display = "none";
    document.getElementById("goal").style.display = "none";
    instructionsList.innerHTML = "";
    navigate(`/test/${currentTest}`);
  };

  const revealBlock = () => {
    setShowTrace(true);
    block.style.zIndex = 10;
    block.style.display = "flex";
  };

  const validateSequence = () => {
    if (startTest) {
      setCurrentTest(currentTest <= 4 ? currentTest + 1 : null);
      setAnserwesSent(true);
      const { top, left } = goalPosition;
     
      console.log(
        positionTop === `${top + 1.5}px` || positionTop === `${top - 1.5}px`
      );
      if (
        positionTop === `${top + 1.5}px` ||
        (positionTop === `${top - 1.5}px` &&
          positionLeft === `${left + 3}px`) ||
        positionLeft === `${left - 3}px`
      ) {
        revealBlock();
        registerTestResult({
          idPregunta: currentTest,
          idEstudiante: codigo,
          valoracion: 1,
        })
          .then(function (response) {
            if (response === 200) {
              setAlert({
                show: true,
                title: "Muy bien",
                message: "Llegaste al Dragón.",
              });
            } else {
              setAlert({
                show: true,
                title: "OH",
                message: "No se pudo registrar la respuesta",
              });
            }
          })
          .catch(function (error) {
          });
      } else {
        revealBlock();
        registerTestResult({
          idPregunta: currentTest,
          idEstudiante: codigo,
          valoracion: 0,
        })
          .then(function (response) {
            if (response === 200) {
              setAlert({
                show: true,
                title: "Mala suerte",
                message: "Casi lo logras",
              });
            }
          })
          .catch(function (error) {
          });
        return;
      }
    } else {
      return;
    }
  };

  const delay = (ms) =>
    new Promise((res) => {
      setTimeout(() => {
        res();
      }, ms);
    });

  useEffect(() => {
    (async function () {
      for (let el of blockRoute) {
        await delay(500);
        setDisplayEl(el);
      }
      setDisplayEl(undefined);
    })();
  }, [blockRoute]);

  useEffect(() => {
    displayEl && setDisplayArray((prev) => [...prev, displayEl]);
  }, [displayEl]);

  return (
    <div className="App">
      {alert.show && <Modal config={alert} setAlert={setAlert} />}
      <div className="fatherTitle">
        <div className="headerTitle">
          <h1 className="">SEPEC TEST</h1>
        </div>
        <div></div>
      </div>
      <img src="" alt="" />
      <img
        className="imgBg"
        src={matriz}
        style={{ display: "none", height: "80px", width: "80px" }}
        alt="grid img"
      />
      <img
        id="start"
        style={{
          display: "none",
          width: "30px",
          height: "34px",
          position: "absolute",
          top: startPostion?.top,
          left: startPostion?.left,
        }}
        src="https://lasimagenesdegoku.com/wp-content/uploads/2018/02/Small-Goku.png"
        alt="start"
      />
      <img
        id="block"
        style={{
          display: "none",
          width: "30px",
          height: "34px",
          position: "absolute",
          top: startPostion?.top,
          left: startPostion?.left,
        }}
        src="https://i.pinimg.com/originals/a5/f9/a2/a5f9a2eb5c0bfb1f66988696e1f31334.png"
        // src="https://lasimagenesdegoku.com/wp-content/uploads/2018/02/Small-Goku.png"
        alt="start"
      />
      {showTrace &&
        displayArray.map((coodinates, index) => (
          <img
            key={index}
            id="block"
            style={{
              display: showTrace ? "flex" : "none",
              width: "30px",
              height: "34px",
              position: "absolute",
              top: coodinates.top,
              left: coodinates.left,
            }}
            src="https://i.pinimg.com/originals/a5/f9/a2/a5f9a2eb5c0bfb1f66988696e1f31334.png"
            // src="https://lasimagenesdegoku.com/wp-content/uploads/2018/02/Small-Goku.png"
            alt="start"
          />
        ))}
      <img
        id="goal"
        style={{
          display: "none",
          width: "30px",
          height: "34px",
          position: "absolute",
          top: goalPosition?.top,
          left: goalPosition?.left,
        }}
        src="https://img.icons8.com/emoji/48/undefined/dragon-face.png"
        alt="goal"
      />

      <div className="test">
        <div className="testView">
          {/* <span className="testTitle">Prueba 1</span> */}
        </div>
        <div className="controls">
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button onClick={handleDirectionClick} className="buttonStyle">
              <img
                name="arriba"
                className="imgSize button"
                src="https://img.icons8.com/doodle/48/undefined/up--v1.png"
                alt="up icon"
              />
            </button>
          </div>
          <div style={{ display: "flex", gap: 7, marginTop: 7 }}>
            <button className="buttonLeftStyles" onClick={handleDirectionClick}>
              <img
                name="izquierda"
                className="imgSize leftSide"
                alt="left icon button"
                src="https://img.icons8.com/doodle/48/undefined/up--v1.png"
              />
            </button>
            <button className="buttonStyle" onClick={handleDirectionClick}>
              <img
                name="abajo"
                className="imgSize downSide"
                src="https://img.icons8.com/doodle/48/undefined/up--v1.png"
                alt="down icon"

              />
            </button>
            <button
              className="buttonRightStyles"
              onClick={handleDirectionClick}
            >
              <img
                name="derecha"
                className="imgSize rightSide"
                alt="right icon button"
                src="https://img.icons8.com/doodle/48/undefined/up--v1.png"
              />
            </button>
          </div>
          <div className="ordersView"></div>
        </div>
      </div>
      <div
        id="actions"
        style={{
          display: "flex",
          "justifyContent": "center",
          gap: "23px",
          marginTop: "40px"
        }}
      >
        <button
          className="button-54"
          onClick={handleStartTest}
          disabled={startTest}
        >
          Empezar
        </button>
        <button
          className="button-54"
          disabled={anserwesSent}
          onClick={validateSequence}
        >
          Comprobar ruta
        </button>

        <button
          className="button-54"
        >
          <Link to="/report">Reportes</Link>
        </button>

      </div>
      {anserwesSent && currentTest != null && (
        <aside style={{ position: "absolute", right: "0", top: "50%" }}>
          <button
            className="button-54"
            onClick={handleNextTest}> Next {currentTest}
          </button>
        </aside>
      )}
      {currentTest == null && (
        <div>
          <nav className="navMenu">
            <a href="/report">Reporte</a>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Tests;
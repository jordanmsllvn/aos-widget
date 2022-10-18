import { useCallback } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "./app.module.scss";

function App({ imageUrl }) {
  const [hotspots, setHotspots] = useState([]);
  const [hovered, setHovered] = useState();
  const ghostRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      let ghostStart = null;
      let boxDims = null;
      const getMousePosition = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        return [(x / rect.width) * 100, (y / rect.height) * 100];
      };
      const getDims = (pos) => {
        const dims = {};

        /**
         *    Quadrants of current position relative
         *    to starting position:
         *    -------------
         *    |  0  |  1  |
         *    -------------
         *    |  3  |  2  |
         *    -------------
         * if 1, make starting point bottom left
         * if 2, make starting point top left
         * if 3, make starting point top right
         * if 0, make starting point bottom right
         */

        let quadrant;
        if (pos[0] < ghostStart[0]) {
          if (pos[1] < ghostStart[1]) quadrant = 0;
          else quadrant = 3;
        } else {
          if (pos[1] < ghostStart[1]) quadrant = 1;
          else quadrant = 2;
        }

        if (quadrant === 0) {
          dims.right = `${100 - ghostStart[0]}%`;
          dims.bottom = `${100 - ghostStart[1]}%`;
        }
        if (quadrant === 1) {
          dims.left = `${ghostStart[0]}%`;
          dims.bottom = `${100 - ghostStart[1]}%`;
        }
        if (quadrant === 2) {
          dims.left = `${ghostStart[0]}%`;
          dims.top = `${ghostStart[1]}%`;
        }
        if (quadrant === 3) {
          dims.right = `${100 - ghostStart[0]}%`;
          dims.top = `${ghostStart[1]}%`;
        }
        dims.width = `${Math.abs(ghostStart[0] - pos[0])}%`;
        dims.height = `${Math.abs(ghostStart[1] - pos[1])}%`;
        return dims;
      };

      const startBox = (pos) => {
        ghostStart = pos;
      };
      const updateBox = (pos) => {
        if (ghostStart) {
          const dims = getDims(pos);
          boxDims = dims;
          ghostRef.current.style.width = dims.width;
          ghostRef.current.style.height = dims.height;
          ghostRef.current.style.top = dims.top || "auto";
          ghostRef.current.style.right = dims.right || "auto";
          ghostRef.current.style.bottom = dims.bottom || "auto";
          ghostRef.current.style.left = dims.left || "auto";
          ghostRef.current.style.display = `block`;
        }
      };
      const endBox = () => {
        setHotspots((h) => [...h, boxDims]);
        ghostRef.current.style.display = `none`;
        ghostStart = null;
      };

      const down = (e) => {
        let pos = getMousePosition(e);
        startBox(pos);
      };
      const move = (e) => {
        let pos = getMousePosition(e);
        updateBox(pos);
      };
      const up = (e) => {
        ghostStart = null;
        endBox();
      };

      canvas.addEventListener("mousedown", down);
      canvas.addEventListener("mousemove", move);
      canvas.addEventListener("mouseup", up);
      return () => {
        canvas.removeEventListener("mousedown", down);
        canvas.removeEventListener("mousemove", move);
        canvas.removeEventListener("mouseup", up);
      };
    }
  }, [ghostRef, canvasRef]);

  return (
    <div className={styles.component}>
      <div className={styles.main}>
        <div className={styles.imgDisplay}>
          <img src={imageUrl} className={styles.image} alt="" />
          <div className={styles.canvas} ref={canvasRef}>
            {hotspots.map((hs, idx) => (
              <div
                key={idx}
                className={`${styles.hotspot} ${
                  hovered === idx ? styles.isHovered : ""
                }`}
                style={{
                  width: hs.width,
                  height: hs.height,
                  top: hs.top || "auto",
                  bottom: hs.bottom || "auto",
                  left: hs.left || "auto",
                  right: hs.right || "auto",
                  pointerEvents: "none",
                }}
              />
            ))}
            <div
              className={styles.ghost}
              style={{ display: "none" }}
              ref={ghostRef}
            ></div>
          </div>
        </div>
        <div className={styles.aside}>
          <ul className={styles.hotspotList}>
            {!!hotspots.length &&
              hotspots.map((hs, idx) => (
                <ListItem
                  idx={idx}
                  key={Math.random()}
                  hotspot={hs}
                  setHovered={setHovered}
                  setHotspots={setHotspots}
                />
              ))}
            {!hotspots.length && (
              <div className={styles.none}>
                <p>Draw a box on the image to the left to create a hotspot.</p>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------

function ListItem({ hotspot, setHotspots, setHovered, idx }) {
  const [collapsed, setCollapsed] = useState(false);
  const removeMe = () => {
    window.confirm("This will remove all child content, are you sure?");
    setHotspots((hs) => {
      hs = [...hs];
      hs.splice(idx, 1);
      return hs;
    });
  };
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const setTitle = useCallback(
    (title) => {
      setHotspots((hs) => {
        return hs.map((h, i) => {
          if (i === idx) {
            return { ...h, title: title };
          } else {
            return h;
          }
        });
      });
    },
    [setHotspots, idx]
  );

  function addSub() {
    setHotspots((hs) => {
      hs = [...hs];
      if (!hs[idx].subs) hs[idx].subs = [];
      hs[idx].subs.push({type: 'child'});
      return hs;
    });
  }
  function addProduct() {
    setHotspots((hs) => {
      hs = [...hs];
      if (!hs[idx].subs) hs[idx].subs = [];
      hs[idx].subs.push({type: 'product'});
      return hs;
    });
  }
  useEffect(() => {
    if (!hotspot.title) {
      setTitle("Hotspot Title");
    }
    if(!hotspot.subs){
      setHotspots(hs => {
        const nhs = [...hs];
        nhs[idx].subs = [];
        return nhs;
      });
    }
  }, [hotspot, setTitle]);

  return (
    <li
      className={styles.hotspotListItem}
      data-collapsed={collapsed}
      onMouseEnter={() => setHovered(idx)}
      onMouseLeave={() => setHovered(null)}
    >
      <div className={styles.hotspotListItemHeading}>
        <div className={styles.title}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-chevron-down"
            viewBox="0 0 16 16"
            onClick={toggleCollapse}
          >
            <path
              fill-rule="evenodd"
              d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
            />
          </svg>
          <input
            type="text"
            defaultValue={hotspot.title}
            onBlur={(e) => setTitle(e.target.value)}
          />
          <div className={styles.delete} onClick={removeMe}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-trash-fill"
              viewBox="0 0 16 16"
            >
              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
            </svg>
          </div>
        </div>
      </div>
      {!!hotspot.subs?.length && (
        <ul>
          {hotspot.subs.map((sub, sIdx) => {
            if(sub.type === "child") return <LevelTwoItem
              sub={sub}
              idx={sIdx}
              topIdx={idx}
              key={Math.random()}
              setHotspots={setHotspots}
            />
            if (sub.type === "product")
              return (
                <Product
                  sub={sub}
                  idx={sIdx}
                  topIdx={idx}
                  pIdx={null}
                  setHotspots={setHotspots}
                  key={Math.random()}
                />
              ); 
          })}
        </ul>
      )}

      <div className={styles.actions}>
        {!!(hotspot.subs && !hotspot.subs.find((h) => h.type === "product")) && (
          <div className={styles.action} onClick={() => addSub()}>
            Add Child
          </div>
        )}
        {!!(hotspot.subs && !hotspot.subs.find((h) => h.type === "child")) && (
          <div className={styles.action} onClick={() => addProduct()}>Add Product Here</div>
        )}
      </div>
    </li>
  );
}
function Product({sub, idx, pIdx, topIdx, setHotspots}){

    const setTitle = (title) => {
      setHotspots((hs) => {
        hs = [...hs];
        if(typeof pIdx === 'number' && typeof topIdx === 'number'){
          hs[topIdx].subs[pIdx].subs[idx].title = title;
        }
        else if (typeof topIdx === 'number'){
          hs[topIdx].subs[idx].title = title;
        }
        return hs;
      });
    }
    const removeMe = () => {
    setHotspots((hs) => {
      hs = [...hs];
      if(typeof pIdx === 'number' && typeof topIdx === 'number'){
        hs[topIdx].subs[pIdx].subs.splice(idx, 1);
      }
      else if (typeof topIdx === 'number'){
        hs[topIdx].subs.splice(idx, 1);
      }
      return hs;
    });
  };
  return (
    <div className={styles.productItem}>
      <input
        type="text"
        placeholder="Enter Product..."
        defaultValue={sub.title}
        onBlur={(e) => setTitle(e.target.value)}
      />
      <div className={styles.delete} onClick={removeMe}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-trash-fill"
          viewBox="0 0 16 16"
        >
          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
        </svg>
      </div>
    </div>
  );
}
// ------------------------------------------

function LevelTwoItem({ sub, idx, topIdx, setHotspots }) {
  const [collapsed, setCollapsed] = useState(false);
  const removeMe = () => {
    window.confirm("This will remove all child content, are you sure?");
    setHotspots((hs) => {
      hs = [...hs];
      hs[topIdx].subs.splice(idx, 1);
      return hs;
    });
  };
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  function addSub() {
    setHotspots((hs) => {
      hs = [...hs];
      let l2 = hs[topIdx].subs[idx];
      if (!l2.subs) l2.subs = [];
      l2.subs.push({type: 'child'});
      return hs;
    });
  }
  function addProduct() {
    setHotspots((hs) => {
      hs = [...hs];
      if (!hs[topIdx].subs[idx].subs) hs[topIdx].subs[idx].subs = [];
      hs[topIdx].subs[idx].subs.push({type: 'product'});
      return hs;
    });
  }
  const setTitle = useCallback(
    (title) => {
      setHotspots((hs) => {
        return hs.map((h, i) => {
          if (i === topIdx) {
            const newSubs = [...h.subs];
            newSubs[idx].title = title;
            return { ...h, subs: newSubs };
          } else {
            return h;
          }
        });
      });
    },
    [setHotspots, idx, topIdx]
  );

  useEffect(() => {
    if (!sub.title && setTitle) {
      setTitle("Section Title");
    }
  }, [sub, setTitle]);

  return (
    <li className={styles.levelTwoItem} data-collapsed={collapsed}>
      <div className={styles.title}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-chevron-down"
          viewBox="0 0 16 16"
          onClick={toggleCollapse}
        >
          <path
            fill-rule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        </svg>
        <input
          type="text"
          defaultValue={sub.title}
          onBlur={(e) => setTitle(idx, e.target.value)}
        />
        <div className={styles.delete} onClick={removeMe}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-trash-fill"
            viewBox="0 0 16 16"
          >
            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
          </svg>
        </div>
      </div>

      {!!sub.subs && (
        <ul>
          {sub.subs.map((sub, sIdx) =>{
           if(sub.type === 'child') return <LevelThreeItem
              sub={sub}
              idx={sIdx}
              pIdx={idx}
              topIdx={topIdx}
              key={Math.random()}
              setHotspots={setHotspots}
            />
           else if(sub.type === 'product') return <Product
              sub={sub}
              idx={sIdx}
              pIdx={idx}
              topIdx={topIdx}
              key={Math.random()}
              setHotspots={setHotspots}
            />
          })}
        </ul>
      )}
      <div className={styles.actions}>
        {!sub.subs?.find((h) => h.type === "product") && (
          <div className={styles.action} onClick={() => addSub()}>
            Add Child
          </div>
        )}
        {!sub.subs?.find((h) => h.type === "child") && (
          <div className={styles.action} onClick={() => addProduct()}>Add Product Here</div>
        )}
      </div>
    </li>
  );
}

// ------------------------------------------

function LevelThreeItem({ sub, idx, pIdx, topIdx, setHotspots }) {
  const [collapsed, setCollapsed] = useState(false);
  const removeMe = () => {
    window.confirm("This will remove all child content, are you sure?");
    setHotspots((hs) => {
      hs = [...hs];
      hs[topIdx].subs[pIdx].subs.splice(idx, 1);
      return hs;
    });
  };
  const removeChild = (i) => {
    setHotspots((hs) => {
      hs = [...hs];
      hs[topIdx].subs[pIdx].subs[idx].subs.splice(i, 1);
      return hs;
    });
  };
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  const addHeading = () => {
    setHotspots((hs) => {
      const nhs = [...hs];
      const item = nhs[topIdx].subs[pIdx].subs[idx];
      if (!item.subs) item.subs = [];
      item.subs.push({ type: "heading", title: "Heading" });
      return nhs;
    });
  };
  const addProduct = () => {
    setHotspots((hs) => {
      const nhs = [...hs];
      const item = nhs[topIdx].subs[pIdx].subs[idx];
      if (!item.subs) item.subs = [];
      item.subs.push({ type: "product", title: "product" });
      return nhs;
    });
  };

  const setTitle = useCallback(
    (title) => {
      setHotspots((hs) => {
        const nhs = [...hs];
        nhs[topIdx].subs[pIdx].subs[idx].title = title;
        return nhs;
      });
    },
    [setHotspots, idx, topIdx]
  );

  useEffect(() => {
    if (!sub.title && setTitle) {
      setTitle("Sub Section Here");
    }
  }, [sub, setTitle]);

  return (
    <li className={styles.levelThreeItem} data-collapsed={collapsed}>
      <div className={styles.title}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-chevron-down"
          viewBox="0 0 16 16"
          onClick={toggleCollapse}
        >
          <path
            fill-rule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        </svg>
        <input
          type="text"
          defaultValue={sub.title}
          onBlur={(e) => setTitle(idx, e.target.value)}
        />
        <div className={styles.delete} onClick={removeMe}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-trash-fill"
            viewBox="0 0 16 16"
          >
            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
          </svg>
        </div>
      </div>
      <ul>
        {!!sub.subs &&
          sub.subs.map((s, i) => {
            return (
              <li
                className={styles.levelFourItem}
                data-type={s.type}
                key={Math.random()}
              >
                <input type="text" defaultValue={s.title} />
                <div className={styles.delete} onClick={() => removeChild(i)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-trash-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                  </svg>
                </div>
              </li>
            );
          })}
      </ul>
      <div className={styles.actions}>
        <div className={styles.action} onClick={addHeading}>
          Add Heading
        </div>
        <div className={styles.action} onClick={addProduct}>
          Add Product
        </div>
      </div>
    </li>
  );
}
export default App;

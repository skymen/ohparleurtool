import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const undoStack = [];
const redoStack = [];

export default new Vuex.Store({
  state: {
    curResolution: {
      width: "640",
      height: "800"
    },
    curScale: 1,
    curSlide: 0,
    slides: [
      [
        {
          type: 'rect',
          config: {
            rotation: 0,
            x: 10,
            y: 10,
            width: 100,
            height: 100,
            scaleX: 1,
            scaleY: 1,
            fill: 'red',
            name: 'rect1',
            draggable: true,
          },
        },
        {
          type: 'rect',
          config: {
            rotation: 0,
            x: 150,
            y: 150,
            width: 100,
            height: 100,
            scaleX: 1,
            scaleY: 1,
            fill: 'green',
            name: 'rect2',
            draggable: true,
          },
        },
        {
          type: 'circle',
          config: {
            rotation: 0,
            x: 150,
            y: 150,
            radius: 50,
            scaleX: 1,
            scaleY: 1,
            fill: 'orange',
            name: 'circ1',
            draggable: true,
          },
        },
        {
          type: 'text',
          config: {
            rotation: 0,
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            text: 'Lorem ipsum',
            fontSize: 18,
            fontFamily: 'Calibri',
            fill: 'black',
            name: 'text1',
            draggable: true,
          },
        }
      ],
      [
        {
          type: 'rect',
          config: {
            rotation: 0,
            x: 10,
            y: 10,
            width: 100,
            height: 100,
            scaleX: 1,
            scaleY: 1,
            fill: 'red',
            name: 'rect1',
            draggable: true,
          },
        },
        {
          type: 'rect',
          config: {
            rotation: 0,
            x: 150,
            y: 150,
            width: 100,
            height: 100,
            scaleX: 1,
            scaleY: 1,
            fill: 'blue',
            name: 'rect2',
            draggable: true,
          },
        },
        {
          type: 'text',
          config: {
            rotation: 0,
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            text: 'Lorem ipsum',
            fontSize: 18,
            fontFamily: 'Calibri',
            fill: 'black',
            name: 'text1',
            draggable: true,
          },
        }
      ],
    ],
  },
  mutations: {
    setCurWidth(state, width) {
      this.commit('saveState');
      this.replaceState({
        ...state,
        curResolution: {
          ...state.curResolution,
          width
        }
      });
    },
    setCurHeight(state, height) {
      this.commit('saveState');
      this.replaceState({
        ...state,
        curResolution: {
          ...state.curResolution,
          height
        }
      });
    },
    setCurSlide(state, value) {
      this.commit('saveState');
      this.replaceState({
        ...state,
        curSlide: value
      });
    },
    zoomIn(state) {
      this.commit('saveState');
      let curScale = state.curScale;

      if (curScale < 3)
        curScale *= 1.1;
      else
        curScale = 3;

      this.replaceState({
        ...state,
        curScale
      });
    },
    zoomOut(state) {
      this.commit('saveState');
      let curScale = state.curScale;

      if (curScale > 0.1)
        curScale /= 1.1;
      else
        curScale = 0.1;

      this.replaceState({
        ...state,
        curScale
      });
    },
    saveState(state) {
      undoStack.push(state);
    },
    undo(state) {
      if (undoStack.length === 0) return;
      redoStack.push(state)
      this.replaceState(undoStack.pop());
    },
    redo(state) {
      if (redoStack.length === 0) return;
      undoStack.push(state)
      this.replaceState(redoStack.pop());
    },
    updateShape(state, e) {
      if (!e.noSaveState)
        this.commit('saveState');
      this.replaceState({
        ...state,
        slides: state.slides.map((slide, i) => {
          if (i === state.curSlide) {
            return  [
              ...state.slides[state.curSlide].map(shape => {
                if (shape.config.name !== e.name) return shape;
                return {
                  ...shape,
                  config: {
                    ...shape.config,
                    ...processConfig(shape, e),
                  }
                }
              })
            ]
          }
          return slide;
        })
      });
    },
    updateShapeParam(state, e) {
      if (!e.noSaveState)
        this.commit('saveState');
      this.replaceState({
        ...state,
        slides: state.slide.map((slide, i) => {
          if (i === state.curSlide) {
            return [
              ...state.slides[state.curSlide].map(shape => {
                if (shape.config.name !== e.name) return shape;
                return {
                  ...shape,
                  config: {
                    ...shape.config,
                    [e.key]: e.value,
                  }
                }
              })
            ]
          }
          return slide;
        })
      });
    },
    setShapesOrder(state, shapes) {
      this.commit('saveState');
      this.replaceState({
        ...state,
        slides: state.slides.map((slide, i) => {
          if (i === state.curSlide) {
            return [
              ...shapes
            ]
          }
          return slide
        })
      });
    }
  },
  actions: {
    keyPress(store, e) {
      var evtobj = window.event? event : e
      if (evtobj.keyCode == 89 && evtobj.ctrlKey) store.commit('redo');
      if (evtobj.keyCode == 90 && evtobj.ctrlKey) store.commit('undo');
    },
    mouseWheel(store, e) {
      if(e.ctrlKey == true)
      {
          if(e.wheelDelta  < 0) {
            store.commit('zoomOut')
          }else {
            store.commit('zoomIn')
          }
      }
    }
  },
  modules: {
    global: {
      state: {
        drawer:true,
      },
      mutations: {
        toggleDrawer(state) {
          state.drawer = !state.drawer
        },
        setDrawer(state, value) {
          state.drawer = value
        },
      }
    }
  }
})

function processConfig(shape, e) {
  let ret = {
    x: e.target.x(),
    y: e.target.y(),
    rotation: e.target.rotation(),
  };
  // let minScale = Math.min(e.target.scaleX(), e.target.scaleY());
  switch(shape.type) {
    case "circle":
      ret.scaleX = e.target.scaleX();
      ret.scaleY = e.target.scaleY();
      break;
    case "ellipse":
      ret.radiusX = e.target.radiusX() * e.target.scaleX();
      ret.radiusY = e.target.radiusY() * e.target.scaleY();
      e.target.scaleX(1);
      e.target.scaleY(1);
      break;
    // case "text":
    //   ret.width = e.target.width() * e.target.scaleX();
    //   ret.height = e.target.height() * e.target.scaleY();
    //   ret.fontSize = e.target.fontSize() * minScale;
    //   e.target.scaleX(1);
    //   e.target.scaleY(1);
    //   break;
    default:
      ret.width = e.target.width() * e.target.scaleX();
      ret.height = e.target.height() * e.target.scaleY();
      e.target.scaleX(1);
      e.target.scaleY(1);
  }
  return ret;
}
<template>
  <pinch-zoom
    disabled
    :minScale="1"
    :limit-zoom="1"
    style="width:100%; height:100%; padding:0; margin:0; background-color:transparent"
  >
    <v-app dark style="background-color:#e2e2e2; width:100%">
      <v-system-bar app height="36" color="secondary">
        <div style="width:10px"></div>
        <v-btn text icon color="white" @click="toggleDrawer">
          <v-icon color="white">mdi-menu</v-icon>
        </v-btn>
        <v-btn text icon color="white" @click="undo">
          <v-icon color="white">mdi-undo</v-icon>
        </v-btn>
        <v-btn text icon color="white" @click="redo">
          <v-icon color="white">mdi-redo</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn text icon color="white">
          <v-icon color="white">mdi-account</v-icon>
        </v-btn>
      </v-system-bar>
      <v-navigation-drawer
        app
        clipped
        width="300"
        :value="drawer"
        disable-route-watcher
        @input="(input) => setDrawer(input)"
        color="white"
      >
        <v-slide-x-transition>
          <v-list
            v-if="$route.path === '/'"
            color="transparent"
            style="position:absolute; width: 100%"
          >
            <v-list-item
              v-for="(item, i) in homeItems"
              :key="i"
              link
              @click="item.click()"
            >
              <v-list-item-icon>
                <v-icon> {{ item.icon }} </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title style="text-align: left;">
                  {{ item.name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-slide-x-transition>
        <v-slide-x-transition>
          <v-list v-if="$route.path === '/edit'" color="transparent">
            <v-container grid-list-xs>
              <v-layout row wrap align-center justify-space-around>
                <v-btn text icon color="primary">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn text icon color="primary">
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
                <v-btn text icon color="primary" @click="zoomOut">
                  <v-icon>mdi-magnify-minus-outline</v-icon>
                </v-btn>
                <v-btn text icon color="primary" @click="zoomIn">
                  <v-icon>mdi-magnify-plus-outline</v-icon>
                </v-btn>
              </v-layout>
              <v-layout row>
                <v-flex xs6>
                  <v-text-field
                    outlined
                    color="primary"
                    dense
                    label="Width"
                    :value="curResolution.width"
                    @change="(val) => setCurWidth(val)"
                  ></v-text-field>
                </v-flex>
                <v-flex xs6>
                  <v-text-field
                    outlined
                    color="primary"
                    dense
                    label="Height"
                    :value="curResolution.height"
                    @change="(val) => setCurHeight(val)"
                  ></v-text-field>
                </v-flex>
              </v-layout>
              <v-divider color="white"></v-divider>
            </v-container>
            <v-expansion-panels
              v-model="panel"
              multiple
              style="width: calc(100% - 24px)"
            >
              <draggable
                class="list-group"
                tag="ul"
                v-model="shapes"
                v-bind="dragOptions"
                :move="onMove"
                @end="onEnd"
                style="width: 100%"
              >
                <ShapeParams
                  v-for="(shape, i) in shapes"
                  :key="i"
                  :shape="shape"
                  :onParamChange="
                    (key, value) => {
                      onParamChange(shape, key, value);
                    }
                  "
                />
              </draggable>
            </v-expansion-panels>
          </v-list>
        </v-slide-x-transition>
      </v-navigation-drawer>
      <v-main>
        <v-slide-y-transition mode="out-in">
          <router-view></router-view>
        </v-slide-y-transition>
      </v-main>
      <v-footer app color="secondary" style="color: white;">
        &copy; 2020 — OhParleur
      </v-footer>
    </v-app>
  </pinch-zoom>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import draggable from "vuedraggable";
import ShapeParams from "@/components/ShapeParams";
export default {
  name: "App",
  components: {
    draggable,
    ShapeParams,
  },
  data() {
    return {
      panel: [],
      homeItems: [
        {
          name: "New",
          icon: "mdi-file",
          click: () => {
            this.$router.push("edit");
          },
        },
        {
          name: "Open",
          icon: "mdi-folder",
          click: () => {
            console.log("Open");
          },
        },
      ],
    };
  },
  computed: {
    ...mapState({
      drawer: (state) => state.global.drawer,
      curResolution: "curResolution",
      curScale: "curScale",
      curShapes: (state) => {
        return state.slides[state.curSlide];
      },
    }),
    ctx() {
      return this;
    },
    shapes: {
      get() {
        return this.curShapes.slice().reverse();
      },
      set(val) {
        this.setShapesOrder(val.reverse());
      },
    },
    dragOptions() {
      return {
        animation: 0,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
      };
    },
  },
  methods: {
    ...mapMutations([
      "toggleDrawer",
      "setDrawer",
      "setCurWidth",
      "setCurHeight",
      "zoomIn",
      "zoomOut",
      "undo",
      "redo",
      "setShapesOrder",
      "updateShapeParam",
    ]),
    onMove(e) {
      const relatedElement = e.relatedContext.element;
      const draggedElement = e.draggedContext.element;
      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      );
    },
    onEnd(e) {
      this.panel = this.panel.map((el) => {
        if (el === e.oldIndex) return e.newIndex;
        return el;
      });
    },
    onParamChange(shape, key, value) {
      this.updateShapeParam({
        name: shape.config.name,
        key,
        value,
      });
    },
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-button {
  width: 0px;
  height: 0px;
}
::-webkit-scrollbar-thumb {
  background: var(--v-secondary-lighten2);
  border: 0px none #ffffff;
  border-radius: 50px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--v-secondary-lighten1);
}
::-webkit-scrollbar-thumb:active {
  background: var(--v-secondary-base);
}
::-webkit-scrollbar-track {
  background: var(--v-secondary-lighten5);
  border: 0px none #ffffff;
  border-radius: 10px;
}
::-webkit-scrollbar-corner {
  background: transparent;
}
html {
  background: var(--v-secondary-lighten5);
  overflow: auto !important;
}
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.list-group {
  min-height: 20px;
}
.list-group-item {
  cursor: move;
}
.list-group-item i {
  cursor: pointer;
}
.pz-zoom-button {
  display: none;
}
</style>

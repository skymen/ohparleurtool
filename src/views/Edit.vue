<template>
  <div style="height: 100%; width: 100%; background-color:#e2e2e2">
    <v-layout fill-height align-center column justify-center>
      <v-layout
        xs11
        align-center
        justify-center
        style="width: 100%; height: calc(100% - 72px) overflow: auto"
      >
        <!-- <p style="z-index:300">{{curShapes}}</p> -->
        <div
          style="width: 100%; height: 94%; position: absolute; overflow: auto; display: flex;"
          class="simpleScrollbars"
        >
          <v-stage
            ref="stage"
            :config="stageConfig"
            @mousedown="handleStageMouseDown"
            @touchstart="handleStageMouseDown"
            style="background-color:white; margin: auto;"
          >
            <v-layer ref="layer">
              <Shape
                v-for="item in curShapes"
                :key="item.id"
                :shape="item"
                :handleTransformEnd="handleTransformEnd"
              />
              <v-transformer ref="transformer" />
            </v-layer>
          </v-stage>
        </div>
      </v-layout>
      <v-flex xs1 style="height: 6%; flex-basis: 6% !important;">
        <v-pagination
          style="align-self: flex-end;"
          :value="curSlide + 1"
          :length="nbSlides"
          circle
          @input="(val) => setCurSlide(val - 1)"
        ></v-pagination>
      </v-flex>
    </v-layout>
    <v-menu
      v-model="showMenu"
      :position-x="menuX"
      :position-y="menuY"
      absolute
      offset-y
    >
      <v-list>
        <v-list-item
          v-for="(item, index) in curMenuItems"
          :key="index"
          @click="item.click(ctx)"
        >
          <v-list-item-title style="text-align:left">{{
            item.title
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import Konva from "konva";
import { mapState, mapMutations } from "vuex";
import Shape from "@/components/Shape";

const GUIDELINE_OFFSET = 5;

export default {
  name: "Edit",
  components: {
    Shape,
  },
  mounted() {
    let step = 15;
    let tolerance = 3;
    let snaps = [];
    let i = 0;
    while (i < 360) {
      snaps.push(i);
      i += step;
    }
    let transformerNode = this.$refs.transformer.getNode();
    transformerNode.setRotationSnaps(snaps);
    transformerNode.setRotationSnapTolerance(tolerance);
    transformerNode.on("transform", this.handleTransform);

    let layer = this.$refs.layer.getNode();
    layer.on("dragmove", this.layerDragMove);
    layer.on("dragend", this.layerDragEnd);
    this.$refs.stage.$el.addEventListener("contextmenu", this.show.bind(this));
    this.ctx = this;
  },
  beforeDestroy() {
    this.$refs.stage.$el.removeEventListener(
      "contextmenu",
      this.show.bind(this)
    );
  },
  data() {
    return {
      selectedShapeName: "",
      showMenu: false,
      menuX: 0,
      menuY: 0,
      ctx: null,
      curMenuItems: [],
      menuItems: [
        {
          title: "Rect1 stuff",
          click(ctx) {
            console.log(ctx);
          },
          condition(ctx) {
            return ctx.selectedShapeName === "rect1";
          },
        },
        {
          title: "Click Me",
          click(ctx) {
            console.log(ctx);
          },
          condition() {
            return true;
          },
        },
        {
          title: "Click Me",
          click(ctx) {
            console.log(ctx);
          },
          condition() {
            return true;
          },
        },
        {
          title: "Delete",
          click(ctx) {
            console.log(ctx);
          },
          condition(ctx) {
            return ctx.selectedShapeName;
          },
        },
      ],
    };
  },
  computed: {
    ...mapState(["curSlide", "curResolution", "curScale"]),
    ...mapState({
      curShapes: (state) => {
        return state.slides[state.curSlide];
      },
      nbSlides: (state) => state.slides.length,
    }),
    stageConfig() {
      // console.log(this.curResolution)
      let curResolution = this.curResolution;
      let curScale = this.curScale;
      return {
        width: curResolution.width * curScale,
        height: curResolution.height * curScale,
        scaleX: curScale,
        scaleY: curScale,
      };
    },
    filteredMenuItems() {
      return this.menuItems.filter((x) => x.condition(this));
    },
  },
  methods: {
    ...mapMutations(["setCurSlide", "updateShape"]),
    handleTransformEnd(e) {
      // shape is transformed, let us save new attrs back to the node
      // find element in our state
      let layer = this.$refs.layer.getNode();
      layer.find(".guid-line").destroy();
      layer.batchDraw();
      this.updateShape({
        target: e.target,
        name: this.selectedShapeName,
      });
    },
    handleTransform(e) {
      this.updateShape({
        target: e.target,
        name: this.selectedShapeName,
        noSaveState: true,
      });
      let layer = this.$refs.layer.getNode();
      layer.find(".guid-line").destroy();

      // find possible snapping lines
      let lineGuideStops = this.getLineGuideStops(e.target);
      // find snapping points of current object
      let itemBounds = this.getObjectSnappingEdges(e.target);

      // now find where can we snap current object
      let guides = this.getGuides(lineGuideStops, itemBounds);

      // do nothing of no snapping
      if (!guides.length) {
        return;
      }

      this.drawGuides(guides);
      // figure out how to force scale
    },
    handleStageMouseDown(e) {
      // clicked on stage - clear selection
      if (e.target === e.target.getStage()) {
        this.selectedShapeName = "";
        this.updateTransformer();
        return;
      }

      // clicked on transformer - do nothing
      const clickedOnTransformer =
        e.target.getParent().className === "Transformer";
      if (clickedOnTransformer) {
        return;
      }

      // find clicked rect by its name
      const name = e.target.name();
      const rect = this.curShapes.find((r) => r.config.name === name);
      if (rect) {
        this.selectedShapeName = name;
      } else {
        this.selectedShapeName = "";
      }
      this.updateTransformer();
    },
    updateTransformer() {
      // here we need to manually attach or detach Transformer node
      const transformerNode = this.$refs.transformer.getNode();
      // console.log(transformerNode)
      const stage = transformerNode.getStage();
      const { selectedShapeName } = this;

      const selectedNode = stage.findOne("." + selectedShapeName);
      // do nothing if selected node is already attached
      if (selectedNode === transformerNode.node()) {
        return;
      }

      if (selectedNode) {
        // attach to another node
        transformerNode.nodes([selectedNode]);
      } else {
        // remove transformer
        transformerNode.nodes([]);
      }
      transformerNode.getLayer().batchDraw();
    },
    getLineGuideStops(skipShape) {
      let stage = this.$refs.stage.getNode();
      // console.log(stage)
      // we can snap to stage borders and the center of the stage
      let vertical = [0, stage.width() / 2, stage.width()];
      let horizontal = [0, stage.height() / 2, stage.height()];

      // and we snap over edges and center of each object on the canvas
      stage
        .find((node) => {
          if (
            node instanceof Konva.Transformer ||
            node.parent instanceof Konva.Transformer
          )
            return false;
          return node.getType() === "Group" || node.getType() === "Shape";
        })
        .forEach((guideItem) => {
          // console.log(guideItem);
          if (guideItem === skipShape) {
            return;
          }
          let box = guideItem.getClientRect();
          // and we can snap to all edges of shapes
          vertical.push([box.x + box.width / 2, box.x, box.x + box.width]);
          horizontal.push([box.y + box.height / 2, box.y, box.y + box.height]);
        });
      return {
        vertical: vertical.flat(),
        horizontal: horizontal.flat(),
      };
    },
    getObjectSnappingEdges(node) {
      let box = node.getClientRect();
      return {
        vertical: [
          {
            guide: Math.round(box.x + box.width / 2),
            offset: Math.round(node.x() - box.x - box.width / 2),
            snap: "center",
          },
          {
            guide: Math.round(box.x),
            offset: Math.round(node.x() - box.x),
            snap: "start",
          },
          {
            guide: Math.round(box.x + box.width),
            offset: Math.round(node.x() - box.x - box.width),
            snap: "end",
          },
        ],
        horizontal: [
          {
            guide: Math.round(box.y + box.height / 2),
            offset: Math.round(node.y() - box.y - box.height / 2),
            snap: "center",
          },
          {
            guide: Math.round(box.y),
            offset: Math.round(node.y() - box.y),
            snap: "start",
          },
          {
            guide: Math.round(box.y + box.height),
            offset: Math.round(node.y() - box.y - box.height),
            snap: "end",
          },
        ],
      };
    },
    getGuides(lineGuideStops, itemBounds, getAll = false) {
      let resultV = [];
      let resultH = [];

      lineGuideStops.vertical.forEach((lineGuide) => {
        itemBounds.vertical.forEach((itemBound) => {
          let diff = Math.abs(lineGuide - itemBound.guide);
          // if the distance between guild line and object snap point is close we can consider this for snapping
          if (diff < GUIDELINE_OFFSET) {
            resultV.push({
              lineGuide: lineGuide,
              diff: diff,
              snap: itemBound.snap,
              offset: itemBound.offset,
            });
          }
        });
      });

      lineGuideStops.horizontal.forEach((lineGuide) => {
        itemBounds.horizontal.forEach((itemBound) => {
          let diff = Math.abs(lineGuide - itemBound.guide);
          if (diff < GUIDELINE_OFFSET) {
            resultH.push({
              lineGuide: lineGuide,
              diff: diff,
              snap: itemBound.snap,
              offset: itemBound.offset,
            });
          }
        });
      });

      let guides = [];

      if (getAll) {
        guides.push(
          ...resultV.map((guide) => {
            return {
              lineGuide: guide.lineGuide,
              offset: guide.offset,
              orientation: "V",
              snap: guide.snap,
            };
          })
        );
        guides.push(
          ...resultH.map((guide) => {
            return {
              lineGuide: guide.lineGuide,
              offset: guide.offset,
              orientation: "H",
              snap: guide.snap,
            };
          })
        );
        return guides;
      }

      // find closest snap
      let minV = resultV.sort((a, b) => a.diff - b.diff)[0];
      let minH = resultH.sort((a, b) => a.diff - b.diff)[0];
      if (minV) {
        guides.push({
          lineGuide: minV.lineGuide,
          offset: minV.offset,
          orientation: "V",
          snap: minV.snap,
        });
      }
      if (minH) {
        guides.push({
          lineGuide: minH.lineGuide,
          offset: minH.offset,
          orientation: "H",
          snap: minH.snap,
        });
      }
      return guides;
    },
    drawGuides(guides) {
      let layer = this.$refs.layer.getNode();
      guides.forEach((lg) => {
        if (lg.orientation === "H") {
          let line = new Konva.Line({
            points: [-6000, lg.lineGuide, 6000, lg.lineGuide],
            stroke: "rgb(0, 161, 255)",
            strokeWidth: 1,
            name: "guid-line",
            dash: [4, 6],
          });
          layer.add(line);
          layer.batchDraw();
        } else if (lg.orientation === "V") {
          let line = new Konva.Line({
            points: [lg.lineGuide, -6000, lg.lineGuide, 6000],
            stroke: "rgb(0, 161, 255)",
            strokeWidth: 1,
            name: "guid-line",
            dash: [4, 6],
          });
          layer.add(line);
          layer.batchDraw();
        }
      });
    },
    layerDragMove(e) {
      if (e.target instanceof Konva.Transformer) return;
      let layer = this.$refs.layer.getNode();
      layer.find(".guid-line").destroy();

      // find possible snapping lines
      let lineGuideStops = this.getLineGuideStops(e.target);
      // find snapping points of current object
      let itemBounds = this.getObjectSnappingEdges(e.target);

      // now find where can we snap current object
      let guides = this.getGuides(lineGuideStops, itemBounds);

      // do nothing of no snapping
      if (!guides.length) {
        return;
      }

      this.drawGuides(guides);

      // now force object position
      guides.forEach((lg) => {
        switch (lg.snap) {
          case "start": {
            switch (lg.orientation) {
              case "V": {
                e.target.x(lg.lineGuide + lg.offset);
                break;
              }
              case "H": {
                e.target.y(lg.lineGuide + lg.offset);
                break;
              }
            }
            break;
          }
          case "center": {
            switch (lg.orientation) {
              case "V": {
                e.target.x(lg.lineGuide + lg.offset);
                break;
              }
              case "H": {
                e.target.y(lg.lineGuide + lg.offset);
                break;
              }
            }
            break;
          }
          case "end": {
            switch (lg.orientation) {
              case "V": {
                e.target.x(lg.lineGuide + lg.offset);
                break;
              }
              case "H": {
                e.target.y(lg.lineGuide + lg.offset);
                break;
              }
            }
            break;
          }
        }
      });
    },
    layerDragEnd(e) {
      let layer = this.$refs.layer.getNode();
      layer.find(".guid-line").destroy();
      layer.batchDraw();
      if (e.target instanceof Konva.Transformer) return;
      this.updateShape({
        target: e.target,
        name: this.selectedShapeName,
      });
    },
    show(e) {
      e.preventDefault();
      this.showMenu = false;
      this.menuX = e.clientX;
      this.menuY = e.clientY;
      this.$nextTick(() => {
        this.curMenuItems = this.filteredMenuItems;
        this.showMenu = true;
      });
    },
  },
};
</script>

<style>
.v-pagination > li {
  box-shadow: 0;
}

.v-pagination > li :focus {
  outline: none;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.8);
}
</style>

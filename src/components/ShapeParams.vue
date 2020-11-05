<template>
    <v-expansion-panel>
        <v-expansion-panel-header>{{shape.config.name}}</v-expansion-panel-header>
        <v-expansion-panel-content>
            <div v-for="(param, index) in params" :key="index">
                <v-text-field
                    v-if="param.type === 'number'"
                    :label="param.key"
                    id="id"
                    outlined
                    dense
                    :value="shape.config[param.key]||param.default"
                    type="number"
                    @input="(val)=>{
                        onParamChange(param.key, parseFloat(val));
                    }"
                ></v-text-field>
                <v-text-field
                    v-if="param.type === 'string'"
                    :label="param.key"
                    id="id"
                    outlined
                    dense
                    :value="shape.config[param.key]||param.default"
                    @input="(val)=>{
                        onParamChange(param.key, val);
                    }"
                ></v-text-field>
                <v-textarea
                    v-if="param.type === 'text'"
                    :label="param.key"
                    id="id"
                    outlined
                    dense
                    :value="shape.config[param.key]||param.default"
                    @input="(val)=>{
                        onParamChange(param.key, val);
                    }"
                ></v-textarea>
            </div>
        <!-- {{shape}} -->
        </v-expansion-panel-content>
    </v-expansion-panel>
    <!-- <v-rect
        v-if="shape.type === 'rect'"
        :config="shape.config"
        @transformend="handleTransformEnd"
    />
    <v-circle
        v-else-if="shape.type === 'circle'"
        :config="shape.config"
        @transformend="handleTransformEnd"
    />
    <v-ellipse
        v-else-if="shape.type === 'ellipse'"
        :config="shape.config"
        @transformend="handleTransformEnd"
    />
    <v-image
        v-else-if="shape.type === 'image'"
        :config="shape.config"
        @transformend="handleTransformEnd"
    />
    <v-text
        v-else-if="shape.type === 'text'"
        :config="shape.config"
        @transformend="handleTransformEnd"
    /> -->
</template>



<script>
  const commonTypes = [
    {
        key: 'name',
        type: 'string',
        default: ''
    },
    {
        key: 'x',
        type: 'number',
        default: 0
    },
    {
        key: 'y',
        type: 'number',
        default: 0
    },
  ];
  const paramTypes = {
      rect: [
      ],
      text: [
          {
              key: 'text',
              type: 'text',
              default: ''
          }
      ]
  };
  export default {
    name: 'ShapeParams',
    props: {
        shape: {
            type: Object,
            required: true,
        },
        onParamChange: {
            type: Function,
            required: true
        }
    },
    computed: {
        params() {
            return [
                ...commonTypes,
                ...(paramTypes[this.shape.type] || [])
            ];
        },
        ctx() {
            return this;
        }
    },
    data: () => ({
    }),
  }
</script>

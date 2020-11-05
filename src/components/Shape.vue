<template>
    <v-rect
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
    />
</template>



<script>
  export default {
    name: 'Shape',
    props: {
        shape: {
            type: Object,
            required: true,
        },
        handleTransformEnd: {
            type: Function,
            required: true
        }
    },
    data: () => ({
    }),
  }
</script>

<template>

<div style="height: 100%; width: 100%; background-color:#e2e2e2">
  <v-layout  align-start wrap>
    <v-flex xs12 sm3 v-for="n in 5" :key="n" style="padding:10px">
      <v-card
      style="height: 200px; width: 100%;">
        test
      </v-card>
    </v-flex>
    <v-flex xs12 sm3 style="padding:10px">
      <v-card
      style="height: 200px; width: 100%;" to="edit">
        last item
      </v-card>
    </v-flex>
  </v-layout>
</div>
</template>

<script>
// import { mapState, mapMutations } from "vuex";

export default {
  name: 'Home',
  components: {
  }
}
</script>

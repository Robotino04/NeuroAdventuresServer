<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    import { base } from "$app/paths";
    import { allGamemodes } from "$lib/Gamemode";

    onMount(() => {
        goto(base + "/scoreboard/" + allGamemodes[0]);
    });
</script>

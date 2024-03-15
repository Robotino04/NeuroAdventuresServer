<script lang="ts">
    import type { ScoreboardEntry } from "$lib/ScoreboardEntry";
    import { titleCase } from "$lib/stringUtils";

    export let entry: ScoreboardEntry;
    export let usingGlobalNames: boolean;
</script>

<tr>
    {#if entry.place <= 3}
        <td class={`place place_${entry.place}`}>{entry.place}.</td>
    {:else}
        <td class="place place_other">{entry.place}.</td>
    {/if}

    <td class="player_name">{usingGlobalNames ? entry.global_name : entry.username}</td>
    <td class="score">{entry.score}</td>
    <td class="gamemode">{titleCase(entry.gamemode)}</td>
</tr>

<style>
    tr {
        padding: 10px;
        background-color: var(--background-color-2);
        border-radius: 8px;
        margin-bottom: 10px;
    }

    .place {
        text-align: right;
        padding-right: 10px;
        font-weight: bold;
    }

    .place_1 {
        color: var(--accent-color);
    }

    .place_2 {
        color: silver;
    }

    .place_3 {
        color: #cd7f32;
    }

    .player_name {
        text-wrap: nowrap;
        white-space: nowrap;
    }

    .gamemode {
        text-transform: capitalize;
    }

    @media screen and (max-device-width: 640px) {
        .gamemode {
            margin: 0;
            padding: 0;
            display: none;
        }
    }
</style>

<script lang="ts">
    import { base } from "$app/paths";
    import HoverToggle from "./HoverToggle.svelte";
    import ListPageSelector from "./ListPageSelector.svelte";

    import ScoreboardEntry from "./ScoreboardEntry.svelte";

    export let gamemode: string;

    $: scoresPromise = (async (
        gamemode: string,
        baseEntry: number,
        numEntriesPerPage: number,
    ) => {
        const res = await fetch(
            `${base}/api/scores?n=${numEntriesPerPage}&o=${baseEntry}&gamemode=${gamemode.toLowerCase()}`,
        );
        const value = await res.json();
        if (res.status != 200) {
            throw new Error(value.message);
        }

        return value;
    })(gamemode, baseEntry, numEntriesPerPage);

    let usingGlobalNames = false;

    export let baseEntry: number;
    export let numEntriesPerPage: number;
</script>

{#await scoresPromise}
    <p>Loading scores...</p>
{:then scores}
    <table>
        <tr>
            <th class="place">Place</th>
            <th class="player">
                Player

                <span class="name-style-toggle">
                    <HoverToggle bind:state={usingGlobalNames}>
                        <span slot="hover">⚙</span>
                        <span slot="on">Showing global names</span>
                        <span slot="off">Showing NSHQ names</span>
                    </HoverToggle>
                </span>
            </th><th class="score">Score</th>
            <th class="gamemode">Gamemode</th>
        </tr>
        {#each scores.scores as entry}
            <ScoreboardEntry {entry} {usingGlobalNames} />
        {/each}
    </table>

    {#if scores.scores.length == 0}
        <p>
            Well, it looks like there are no submissions yet. Better start
            playing and getting that highscore!
        </p>
    {/if}
    <ListPageSelector
        bind:baseEntry
        numEntries={scores.num_scores}
        {numEntriesPerPage}
    />
{:catch error}
    <p style="color: red">Couldn't load scores ({error.message})</p>
{/await}

<style>
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        color: var(--text-color-on-background);
        box-shadow: 2px 4px 20px 3px var(--table-shadow-color);
    }

    th {
        padding: 12px;
        padding-left: 0;
        text-align: left;
        background-color: var(--accent-color);
        color: var(--text-color-on-accent);
    }

    .name-style-toggle {
        font-size: small;
        position: absolute;
        display: inline;
        transform: translateY(-25%);
    }
    .player {
        text-wrap: nowrap;
        white-space: nowrap;
        padding-left: 0;
    }

    p {
        width: 100%;
    }
    .place {
        padding-left: 12px;
        width: 0;
    }

    @media screen and (max-device-width: 640px) {
        .gamemode {
            display: none;
        }
        table {
            font-size: 1.5rem;
        }
    }

    @media (hover: none) {
        .name-style-toggle {
            display: none;
        }
    }
</style>

<script lang="ts">
    import { page } from "$app/stores";

    export let baseEntry: number;
    export let numEntries: number;
    export let numEntriesPerPage: number;

    function clampToPages(newBase: number) {
        newBase = Math.floor(newBase / numEntriesPerPage) * numEntriesPerPage;
        newBase = Math.max(
            Math.min(
                newBase,
                Math.floor((numEntries-1) / numEntriesPerPage) *
                    numEntriesPerPage,
            ),
            0,
        );
        return newBase;
    }

    async function setBaseEntry(newBase: number) {
        newBase = clampToPages(newBase);
        $page.url.searchParams.set("o", newBase.toString());
        window.history.replaceState({}, "", $page.url.toString());
        baseEntry = newBase;
    }
</script>

<div class="container">
    <button
        on:click={() => {
            setBaseEntry(0);
        }}
        >&LeftAngleBracket;&LeftAngleBracket;
    </button>
    <button
        on:click={() => {
            setBaseEntry(baseEntry - numEntriesPerPage);
        }}
        >&LeftAngleBracket;
    </button>
    <div class="current-page">
        {baseEntry / numEntriesPerPage + 1} / {Math.ceil(
            numEntries / numEntriesPerPage,
        )}
    </div>
    <button
        on:click={() => {
            setBaseEntry(baseEntry + numEntriesPerPage);
        }}
        >&RightAngleBracket;
    </button>
    <button
        on:click={() => {
            setBaseEntry(numEntries);
        }}
        >&RightAngleBracket;&RightAngleBracket;
    </button>
</div>

<style>
    div.container {
        display: flex;
        flex-direction: row;
        margin-top: 10px;
        text-align: center;
    }
    button {
        background-color: var(--accent-color);
        color: var(--text-color-on-accent);

        border-color: transparent;
        border-style: solid;
        border-radius: 4px;
        border-width: 6px;

        padding: 8px 16px;
        cursor: pointer;
        transition: background-color 0.3s;
        margin-right: 5px;
        margin-left: 5px;
    }

    button:hover {
        border-color: var(--button-border-color);
    }

    .current-page {
        text-align: center;
        margin: auto;
    }

    @media screen and (max-device-width: 640px) {
        .current-page {
            font-size: 1.5rem;
        }
    }
</style>

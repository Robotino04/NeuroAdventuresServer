<script lang="ts">
    import { allGamemodes } from "$lib/Gamemode";
    import { titleCase } from "$lib/stringUtils";
    import { base } from "$app/paths";
</script>

<div class="container">
    <nav class="header">
        <ol>
            {#each allGamemodes as gamemode}
                <li>
                    <a href="{base}/scoreboard/{gamemode}/"
                        >{titleCase(gamemode)}</a
                    >
                </li>
            {/each}
        </ol>
    </nav>
    <slot />
</div>

<style>
    .container {
        max-width: 80%;
        display: flex;
        align-items: center;
        justify-content: center;
        list-style-type: none;
        flex-direction: column;
        margin: auto;
        font-size: 2em;
    }
    nav.header {
        width: 100%;
        margin: auto;
        background-color: var(--background-color-2);
        padding: 0;
        padding-top: 10px;
        padding-bottom: 10px;
        border-radius: 8px;
        font-size: x-large;
        box-shadow: 2px 4px 20px 2px var(--table-shadow-color);
        overflow: scroll;
    }

    nav.header ol {
        display: flex;
        align-items: center;
        justify-content: center;
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    nav.header li {
        margin-left: 10px;
        margin-right: 10px;
    }

    nav.header a {
        text-decoration: none;
        color: var(--text-color-on-background-2);
        transition: color 0.3s;
    }

    nav.header a:hover {
        color: var(--accent-color);
    }
    @media screen and (max-device-width: 640px) {
        .container {
            max-width: 100%;
            font-size: 1rem;
        }
    }
</style>

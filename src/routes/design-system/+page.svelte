<script>
    import { Colors } from "$lib/design-system";
    import { typography } from '$lib/design-system';

    const colorsWithData = Object.entries(Colors).map(([colorFamily, shades]) => ({
        colorFamily,
        shades,
    }));
</script>

<div class="container">
    <a href="design-system/component-showcase">Component Showcase</a>
    <div class="typography-container">
        <h2>Typography</h2>
        <p style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.special}; font-weight: {typography.fontWeights.regular};">
            Heading / Special / Regular
        </p>
        <p style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h0}; font-weight: {typography.fontWeights.regular};">
            Heading / H0 / Regular
        </p>
        <h1 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h1}; font-weight: {typography.fontWeights.regular};">
            Heading / H1 / Regular
        </h1>
        <h2 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h2}; font-weight: {typography.fontWeights.regular};">
            Heading / H2 / Regular
        </h2>
        <h3 style="font-family: {typography.fontFamily.heading}; font-size: {typography.fontSizes.h3}; font-weight: {typography.fontWeights.regular};">
            Heading / H3 / Regular
        </h3>
        <h4 style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.h4}; font-weight: {typography.fontWeights.medium};">
            Heading / H4 / Regular
        </h4>
        <h5 style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.h5}; font-weight: {typography.fontWeights.medium};">
            Heading / H5 / Regular
        </h5>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.regular};">
            Body / Regular / Regular
        </p>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.regular}; font-weight: {typography.fontWeights.medium};">
            Body / Regular / Medium
        </p>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.regular};">
            Body / Small / Regular
        </p>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.medium};">
            Body / Small / Medium
        </p>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.small}; font-weight: {typography.fontWeights.bold};">
            Body / Small / Bold
        </p>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular}; font-style: italic;">
            Body / X-Small / Regular Italic
        </p>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular};">
            Body / X-Small / Regular
        </p>
        <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.medium};">
            Body / X-Small / Medium
        </p>
    </div>
    <hr>
    <div class="color-container">
        <h2>Color Palette</h2>
        <div class="palette">
            {#each colorsWithData as { colorFamily, shades }}
            <div class="color-family">
                <h3>{colorFamily}</h3>
                <div class="shades">
                {#each Object.entries(shades) as [shade, hex]}
                    <div class="shade">
                    <div
                        class="color-box"
                        style="background-color: {hex};"
                        title="{hex}"
                    ></div>
                    <span>{shade}: {hex}</span>
                    </div>
                {/each}
                </div>
            </div>
            {/each}
        </div>
    </div>
</div>

<style>
    h1, h2, h3, h4, h5, p {
        margin: 0;
    }
    .container {
        margin: 20px;
    }
    .typography-container {
        display: flex;
        flex-direction: column;
        row-gap: 8px;
        margin-bottom: 32px;
    }
    .color-container {
        margin-top: 32px;
    }
    .palette {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
    }

    .color-family {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        background-color: #fff;
    }

    .color-family h3 {
        margin-bottom: 1rem;
        text-transform: capitalize;
        font-size: 1.2rem;
        color: #333;
    }

    .shades {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 1rem;
    }

    .shade {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: monospace;
        text-align: center;
    }

    .color-box {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        margin-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
        .palette {
        grid-template-columns: 1fr;
        }

        .shades {
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        }
    }

    @media (max-width: 480px) {
        .shade {
        font-size: 0.8rem;
        padding: 0.4rem;
        }

        .color-box {
        width: 30px;
        height: 30px;
        }
    }
    .text-body {
        font-size: 1rem;
    }
</style>

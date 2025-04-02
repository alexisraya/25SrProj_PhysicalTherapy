<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { typography } from '$lib/design-system/typography';
    import RemixIcon from '$lib/design-system/components/RemixIcon.svelte';
    
    let options=[
        { value: 'pain', label: 'Pain' },
        { value: 'mood', label: 'Mood' },
    ]
    export let value: string = 'pain';
    export let label: string = 'Pain';
    export let placeholder: string = 'Select an option';
    
    let isOpen = false;
    let selectedLabel = '';
    let dropdownElement: HTMLDivElement;
    
    const dispatch = createEventDispatcher();
    
    // Set initial selected label
    $: {
        const selected = options.find(opt => opt.value === value);
        selectedLabel = selected ? selected.label : placeholder;
    }
    
    function toggleDropdown() {
        isOpen = !isOpen;
    }
    
    function selectOption(optionValue: string, optionLabel: string) {
        value = optionValue;
        selectedLabel = optionLabel;
        isOpen = false;
        dispatch('change', { value: optionValue });
    }
    
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
            isOpen = false;
        }
    }
    
    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });
</script>

<div class="dropdown-wrapper" bind:this={dropdownElement}>
    <div class="dropdown-header" on:click={toggleDropdown} aria-haspopup="listbox" aria-expanded={isOpen} id="custom-dropdown">
        <span class:placeholder={!value}>
            <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular};">{selectedLabel}</p>
        </span>
        <div class="dropdown-arrow" class:open={isOpen}>
            <RemixIcon name="arrow-down-s-line" size="20px"/>
        </div>
    </div>
    
    {#if isOpen}
        <div class="dropdown-options" role="listbox">
            {#each options as option}
                <div 
                    class="dropdown-option" 
                    class:selected={option.value === value}
                    on:click={() => selectOption(option.value, option.label)}
                    role="option"
                    aria-selected={option.value === value}
                >
                    <p style="font-family: {typography.fontFamily.body}; font-size: {typography.fontSizes.xsmall}; font-weight: {typography.fontWeights.regular};">{option.label}</p>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    p {
        margin: 0;
    }
    .dropdown-wrapper {
        position: relative;
    }
    
    label {
        display: block;
        margin-bottom: 8px;
    }
    
    .dropdown-header {
        display: inline-flex;
        align-items: center;
        column-gap: 8px;
        padding: 4px 4px 4px 8px;
        border-radius: 4px;
        background-color: var(--background-secondary);
        cursor: pointer;
        user-select: none;
    }
    
    .dropdown-header:hover {
        border-color: #999;
    }
    
    .placeholder {
        color: #999;
    }
    
    .dropdown-arrow {
        height: 20px;
        width: 20px;
        transition: transform 0.2s ease;
    }
    
    .dropdown-arrow.open {
        transform: rotate(-180deg);
    }
    
    .dropdown-options {
        position: absolute;
        top: calc(100% + 2px);
        right: 0;
        width: 71px;
        max-height: 200px;
        overflow-y: auto;
        background-color: var(--background-secondary);
        border-radius: 4px;
        z-index: 1000;
    }
    
    .dropdown-option {
        padding: 4px 0 2px 8px;
        cursor: pointer;
    }
    
    .dropdown-option.selected {
        background-color: var(--pain-mood-selected);
    }
</style>
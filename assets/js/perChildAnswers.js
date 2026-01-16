/**
 * Per-child answers functionality
 * Allows users to add different answers for different children
 */

function setupPerChildAnswers() {
  const addButton = document.getElementById('add-another-child-btn');
  if (!addButton) return;

  const template = document.getElementById('per-child-entry-template');
  const container = document.getElementById('additional-children-container');

  if (!template || !container) return;

  // Parse data from the button's data attributes
  const numberOfChildren = parseInt(addButton.dataset.numberOfChildren, 10);
  const childOptions = JSON.parse(addButton.dataset.childOptions || '[]');
  const namesOfChildren = JSON.parse(addButton.dataset.namesOfChildren || '[]');
  const fieldBaseName = addButton.dataset.fieldBaseName;

  let entryCounter = 1; // Start from 1 since 0 is the default/all children entry

  /**
   * Creates a new per-child entry
   */
  function addChildEntry() {
    const entryIndex = entryCounter++;
    const fieldName = `${fieldBaseName}-${entryIndex}`;

    // Clone the template
    const templateContent = template.content.cloneNode(true);
    const entryDiv = templateContent.querySelector('.per-child-entry');

    // Update entry index
    entryDiv.dataset.entryIndex = entryIndex;

    // Update selector IDs and names
    const selector = entryDiv.querySelector('select');
    const selectorId = `child-selector-${entryIndex}`;
    selector.id = selectorId;
    selector.name = selectorId;

    // Update selector label
    const selectorLabel = entryDiv.querySelector(`label[for="child-selector-ENTRY_INDEX"]`);
    if (selectorLabel) {
      selectorLabel.setAttribute('for', selectorId);
    }

    // Populate child options
    childOptions.forEach(option => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.textContent = option.text;
      selector.appendChild(optionEl);
    });

    // Update textarea IDs and names
    const textarea = entryDiv.querySelector('textarea');
    textarea.id = fieldName;
    textarea.name = fieldName;

    // Update textarea label
    const textareaLabel = entryDiv.querySelector(`label[for="FIELD_NAME"]`);
    if (textareaLabel) {
      textareaLabel.setAttribute('for', fieldName);
    }

    // Add remove button handler
    const removeBtn = entryDiv.querySelector('.remove-child-entry-btn');
    removeBtn.addEventListener('click', () => {
      entryDiv.remove();
      updateAddButtonVisibility();
    });

    // Add to container
    container.appendChild(entryDiv);

    // Update visibility of add button
    updateAddButtonVisibility();

    // Focus the new selector
    selector.focus();
  }

  /**
   * Updates the visibility of the "Add another child" button
   * Hide it if we've added entries for all children
   */
  function updateAddButtonVisibility() {
    const existingEntries = container.querySelectorAll('.per-child-entry').length;
    // Allow adding entries up to (numberOfChildren - 1) since entry 0 is for "all children"
    // But actually, users might want different answers for each child individually
    // So we allow up to numberOfChildren additional entries
    if (existingEntries >= numberOfChildren) {
      addButton.style.display = 'none';
    } else {
      addButton.style.display = '';
    }
  }

  // Add click handler for the "Add another child" button
  addButton.addEventListener('click', addChildEntry);

  // Update button visibility on initial load
  updateAddButtonVisibility();
}

export default setupPerChildAnswers;

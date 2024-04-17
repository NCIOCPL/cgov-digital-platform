import { getLandingRowsAndColsInfo } from '../../../../lib/core/analytics/landing-page-contents-helper';
import { trackOther } from '../../../../lib/core/analytics/eddl-util';
import { USAComboBox } from '@nciocpl/ncids-js/usa-combo-box';

/**
 * Switches the HTML back to non-error state
 */
const stopErrorState = (): void => {
	const formGroup = document.querySelector('.usa-form-group');
	const comboBoxEl = document.querySelector('.usa-combo-box') as HTMLElement;
	const selectEl = document.getElementsByName('find-cancer-type');
	const errorSpan = formGroup?.querySelector('.usa-error-message');
	const submitButton = document
		.getElementById('cancer-type-form')
		?.querySelector('.usa-button');
	formGroup?.classList.remove('usa-form-group--error');
	comboBoxEl.classList.remove('usa-combo-box--nci-error');
	selectEl[0].classList.remove('usa-select--nci-error');
	submitButton?.classList.remove('margin-bottom-1');
	errorSpan?.remove();
};

/**
 * Switches the HTML to error state.
 */
const updateError = (): void => {
	const comboBoxEl = document.querySelector('.usa-combo-box') as HTMLElement;
	const formGroup = document.querySelector('.usa-form-group');
	const selectEl = document.getElementsByName('find-cancer-type');
	if (
		!formGroup?.classList.contains('usa-form-group--error') &&
		!comboBoxEl.classList.contains('usa-combo-box--nci-error') &&
		!selectEl[0].classList.contains('usa-select--nci-error')
	) {
		formGroup?.classList.add('usa-form-group--error');
		comboBoxEl?.classList.add('usa-combo-box--nci-error');
		selectEl[0].classList.add('usa-select--nci-error');
		const errorMessageSpan = document.createElement('span');
		errorMessageSpan.classList.add('usa-error-message');
		const lang: 'en' | 'es' = (
			document.documentElement.lang === 'es' ? 'es' : 'en'
		) as 'en' | 'es';
		if (lang == 'en') {
			errorMessageSpan.textContent = 'Please enter a cancer type';
		} else {
			errorMessageSpan.textContent = 'Escribir el nombre del cáncer';
		}
		const labelElement = formGroup?.querySelector('.usa-label');
		labelElement?.parentNode?.insertBefore(errorMessageSpan, comboBoxEl);
		const submitButton = document
			.getElementById('cancer-type-form')
			?.querySelector('.usa-button');
		submitButton?.classList.add('margin-bottom-1');
	}
};

/**
 * Handles focus event on the form.
 * @param {FocusEvent} evt
 */
const focusHandler = (evt: FocusEvent): void => {
	const target = evt.target as HTMLElement;
	const realTarget =
		(target.closest('.usa-combo-box') as HTMLElement) ?? target;
	const linkArea =
		realTarget.getAttribute('type') === 'submit' ? 'Button' : 'Dropdown';

	const currentTarget = evt.currentTarget as HTMLElement;
	const { pageRows, pageRowIndex, pageRowCols, pageRowColIndex } =
		getLandingRowsAndColsInfo(currentTarget);

	trackOther(
		`LP:RawHTMLCancerTypeSearch:FormFocus`,
		`LP:RawHTMLCancerTypeSearch:FormFocus`,
		{
			location: 'Body',
			componentType: 'Raw HTML',
			pageRows,
			pageRowIndex,
			pageRowCols,
			pageRowColIndex,
			containerItems: 1,
			containerItemIndex: 1,
			componentTheme: 'Not Defined',
			componentVariant: 'Cancer Type Search',
			title: 'Cancer Types Search',
			linkArea,
			formAction: 'Form Focus',
			selectedItemsCounter: 0,
			noResultCounter: 0,
			clearCounter: 0,
			errorCounter: 0,
		}
	);
};

/**
 * Wires up component per cgdp requirements.
 */
const initialize = (): void => {
	const state = {
		selectedItemsCounter: 0,
		noResultsCounter: 0,
		clearCounter: 0,
		errorCounter: 0,
	};

	const comboBoxEl = document.querySelector('.usa-combo-box') as HTMLElement;
	const comboBox = USAComboBox.create(comboBoxEl);

	comboBoxEl.addEventListener('usa-combo-box:unselected', (evt) => {
		state.clearCounter = state.clearCounter + 1;
		const detail = (evt as CustomEvent).detail;
		const target = evt.currentTarget as HTMLElement;
		const { pageRows, pageRowIndex, pageRowCols, pageRowColIndex } =
			getLandingRowsAndColsInfo(target);
		trackOther(
			`LP:RawHTMLCancerTypeSearch:ClearForm`,
			`LP:RawHTMLCancerTypeSearch:ClearForm`,
			{
				location: 'Body',
				componentType: 'Raw HTML',
				pageRows,
				pageRowIndex,
				pageRowCols,
				pageRowColIndex,
				containerItems: 1,
				containerItemIndex: 1,
				componentTheme: 'Not Defined',
				componentVariant: 'Cancer Type Search',
				title: 'Cancer Types Search',
				linkArea: 'Dropdown',
				formAction: 'Clear Form',
				selectedItemCounter: state.selectedItemsCounter,
				noResultCounter: state.noResultsCounter,
				clearCounter: state.clearCounter,
				errorCounter: state.errorCounter,
				clearedValue: detail.previouslySelected[0].text,
			}
		);
	});

	comboBoxEl.addEventListener('usa-combo-box:selected', (evt) => {
		stopErrorState();
		const detail = (evt as CustomEvent).detail;
		if (detail.previouslySelected[0].text !== detail.selected.item(0).text) {
			state.selectedItemsCounter = state.selectedItemsCounter + 1;
			const target = evt.currentTarget as HTMLElement;
			const { pageRows, pageRowIndex, pageRowCols, pageRowColIndex } =
				getLandingRowsAndColsInfo(target);
			const linkPosition = Array.from(comboBox.getOptions()).indexOf(
				detail.selected.item(0)
			);
			trackOther(
				`LP:RawHTMLCancerTypeSearch:SelectItem`,
				`LP:RawHTMLCancerTypeSearch:SelectItem`,
				{
					location: 'Body',
					componentType: 'Raw HTML',
					pageRows,
					pageRowIndex,
					pageRowCols,
					pageRowColIndex,
					containerItems: 1,
					containerItemIndex: 1,
					componentTheme: 'Not Defined',
					componentVariant: 'Cancer Type Search',
					title: 'Cancer Types Search',
					linkArea: 'Dropdown',
					totalLinks: comboBox.getOptions().length - 1,
					linkPosition,
					formAction: 'Selected Item',
					selectedItemCounter: state.selectedItemsCounter,
					noResultCounter: state.noResultsCounter,
					clearCounter: state.clearCounter,
					errorCounter: state.errorCounter,
					selectedValue: detail.inputValue,
				}
			);
		}
	});

	comboBoxEl.addEventListener('usa-combo-box:listbox:no-results', (evt) => {
		const detail = (evt as CustomEvent).detail;
		state.noResultsCounter = state.noResultsCounter + 1;
		const target = evt.currentTarget as HTMLElement;
		const { pageRows, pageRowIndex, pageRowCols, pageRowColIndex } =
			getLandingRowsAndColsInfo(target);
		trackOther(
			`LP:RawHTMLCancerTypeSearch:NoResultsFound`,
			`LP:RawHTMLCancerTypeSearch:NoResultsFound`,
			{
				location: 'Body',
				componentType: 'Raw HTML',
				pageRows,
				pageRowIndex,
				pageRowCols,
				pageRowColIndex,
				containerItems: 1,
				containerItemIndex: 1,
				componentTheme: 'Not Defined',
				componentVariant: 'Cancer Type Search',
				title: 'Cancer Types Search',
				linkArea: 'Dropdown',
				formAction: 'No Results Found',
				selectedItemCounter: state.selectedItemsCounter,
				noResultCounter: state.noResultsCounter,
				clearCounter: state.clearCounter,
				errorCounter: state.errorCounter,
				noResultsValue: detail.inputValue,
			}
		);
	});

	const form = document.getElementById('cancer-type-form');
	form?.addEventListener('submit', (evt) => {
		evt.preventDefault();
		const target = evt.currentTarget as HTMLElement;
		const { pageRows, pageRowIndex, pageRowCols, pageRowColIndex } =
			getLandingRowsAndColsInfo(target);
		const selectedOption = comboBox.getSelectedOptions().item(0);
		if (
			selectedOption === null ||
			selectedOption.text === 'Select a cancer type' ||
			selectedOption.text === 'Seleccionar tipo de cáncer'
		) {
			updateError();
			state.errorCounter = state.errorCounter + 1;
			trackOther(
				`LP:RawHTMLCancerTypeSearch:SubmitError`,
				`LP:RawHTMLCancerTypeSearch:SubmitError`,
				{
					location: 'Body',
					componentType: 'Raw HTML',
					pageRows,
					pageRowIndex,
					pageRowCols,
					pageRowColIndex,
					containerItems: 1,
					containerItemIndex: 1,
					componentTheme: 'Not Defined',
					componentVariant: 'Cancer Type Search',
					title: 'Cancer Types Search',
					linkArea: 'Button',
					formAction: 'Submit Error',
					selectedItemsCounter: state.selectedItemsCounter,
					noResultCounter: state.noResultsCounter,
					clearCounter: state.clearCounter,
					errorCounter: state.errorCounter,
					attemptedValue: 'no text entered',
				}
			);
		} else {
			const linkPosition = Array.from(comboBox.getOptions()).indexOf(
				selectedOption
			);
			trackOther(
				`LP:RawHTMLCancerTypeSearch:SubmitForm`,
				`LP:RawHTMLCancerTypeSearch:SubmitForm`,
				{
					location: 'Body',
					componentType: 'Raw HTML',
					pageRows,
					pageRowIndex,
					pageRowCols,
					pageRowColIndex,
					containerItems: 1,
					containerItemIndex: 1,
					componentTheme: 'Not Defined',
					componentVariant: 'Cancer Type Search',
					title: 'Cancer Types Search',
					linkArea: 'Button',
					totalLinks: comboBox.getOptions().length - 1,
					linkPosition,
					formAction: 'Submit Form',
					selectedItemsCounter: state.selectedItemsCounter,
					noResultCounter: state.noResultsCounter,
					clearCounter: state.clearCounter,
					errorCounter: state.errorCounter,
					submittedValue: selectedOption.text ?? '',
				}
			);

			if (
				selectedOption.dataset.link &&
				selectedOption.dataset.link.trim() !== ''
			) {
				window.location.href = selectedOption.dataset.link as string;
			} else {
				console.error(
					`Selection option, ${selectedOption.text}, is missing data-link attribute`
				);
			}
		}
	});

	// Focus handler for now just fires for the very first interaction, and it does not need
	// the combobox or state to be passed in.
	form?.addEventListener('focus', focusHandler, {
		capture: true,
		passive: true,
		once: true,
	});
};

export default initialize;

const contents = `<div id="megamenu-layer" class="nci-megamenu"><div class="grid-container"><div class="grid-row grid-gap-1"><div class="grid-col-3 nci-megamenu__primary-pane"><a class="nci-megamenu__primary-link" href="/root">primary label</a></div><div class="nci-megamenu__items-pane grid-col-9"><div class="grid-row grid-gap"><div class="grid-col-4"><ul class="nci-megamenu__list"><li class="nci-megamenu__list-item"><a class="nci-megamenu__list-item-link" href="/root/1">list 1</a></li></ul></div></div></div></div></div></div>`;

const getHeadingOnlyListMegaMenu = () => {
	const template = document.createElement('template');
	template.innerHTML = contents;
	return template.content.firstChild;
};

export default getHeadingOnlyListMegaMenu;

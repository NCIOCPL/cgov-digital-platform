export const cgdpOnThisPageDom = `
	<article>
		<h1 class="nci-heading-h1">Feelings and Cancer</h1>
		<nav class="cgdp-on-this-page" role="navigation">
			<h2 class="cgdp-on-this-page__header">On This Page</h2>
			<ul>
				<li><a href="#overwhelmed">Overwhelmed</a></li>
				<li><a href="#denial">Denial</a></li>
				<li><a href="#anger">Anger</a></li>
				<li><a href="#fear-and-worry">Fear and Worry</a></li>
				<li><a href="#hope">Hope</a></li>
			</ul>
		</nav>
	</article>
`;

export const cgdpOnThisPageNoTitleDom = `
	<nav class="cgdp-on-this-page" role="navigation">
		<h2 class="cgdp-on-this-page__header">On This Page</h2>
		<ul>
			<li><a href="#overwhelmed">Overwhelmed</a></li>
			<li><a href="#denial">Denial</a></li>
			<li><a href="#anger">Anger</a></li>
			<li><a href="#fear-and-worry">Fear and Worry</a></li>
			<li><a href="#hope">Hope</a></li>
		</ul>
	</nav>
`;

export const cgdpOnThisPageBadDom = `
	<nav class="" role="navigation">
		<h2 class="cgdp-on-this-page__header">On This Page</h2>
		<ul>
			<li><a href="#overwhelmed">Overwhelmed</a></li>
			<li><a href="#denial">Denial</a></li>
			<li><a href="#anger">Anger</a></li>
			<li><a href="#fear-and-worry">Fear and Worry</a></li>
			<li><a href="#hope">Hope</a></li>
		</ul>
	</nav>
`;

export const cgdpOnThisPageNoListDom = `
	<nav class="cgdp-on-this-page" role="navigation">
		<h2 class="cgdp-on-this-page__header">On This Page</h2>
		<a href="#overwhelmed">Overwhelmed</a>
		<a href="#denial">Denial</a>
		<a href="#anger">Anger</a>
		<a href="#fear-and-worry">Fear and Worry</a>
		<a href="#hope">Hope</a>
	</nav>
`;

export const cgdpOnThisPageNoLinkTextDom = `
	<article>
		<h1 class="nci-heading-h1">Feelings and Cancer</h1>
		<nav class="cgdp-on-this-page" role="navigation">
			<h2 class="cgdp-on-this-page__header">On This Page</h2>
			<ul>
				<li><a data-testid="first-link" href="#overwhelmed"></a></li>
				<li><a href="#denial">Denial</a></li>
				<li><a href="#anger">Anger</a></li>
				<li><a href="#fear-and-worry">Fear and Worry</a></li>
				<li><a href="#hope">Hope</a></li>
			</ul>
		</nav>
	</article>
`;

define([
	'intern!tdd',
	'intern/chai!assert',
	'dgrid/OnDemandGrid',
	'dgrid/test/data/createSyncStore',
	'dojo/_base/lang',
	'dojo/aspect',
	'dojo/when',
	'dojo/query'
], function (
	test,
	assert,
	OnDemandGrid,
	createSyncStore,
	lang,
	aspect,
	when,
	query
) {

	/**
	 * The data is similar to genericData but with 200 rows.
	 * If I change genericData to output 200 rows the functaionl test for keyboard will fail
	 */
	var grid,
		data = {
			identifier: 'id',
			label: 'id',
			items: []
		},
		dataList = [
			{
				col1: 'normal',
				col2: false,
				col3: 'new',
				col4: 'But are not followed by two hexadecimal',
				col5: 29.91,
				col6: 10,
				col7: false
			},
			{
				col1: 'important',
				col2: false,
				col3: 'new',
				col4: 'Because a % sign always indicates',
				col5: 9.33,
				col6: -5,
				col7: false
			},
			{
				col1: 'important',
				col2: false,
				col3: 'read',
				col4: 'Signs can be selectively',
				col5: 19.34,
				col6: 0,
				col7: true
			},
			{
				col1: 'note',
				col2: false,
				col3: 'read',
				col4: 'However the reserved characters',
				col5: 15.63,
				col6: 0,
				col7: true
			},
			{
				col1: 'normal',
				col2: false,
				col3: 'replied',
				col4: 'It is therefore necessary',
				col5: 24.22,
				col6: 5.50,
				col7: true
			},
			{
				col1: 'important',
				col2: false,
				col3: 'replied',
				col4: 'To problems of corruption by',
				col5: 9.12,
				col6: -3,
				col7: true
			},
			{
				col1: 'note',
				col2: false,
				col3: 'replied',
				col4: 'Lorem ipsum dolor sit amet,' +
					  'consectetur adipisicing elit,' +
					  'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,' +
					  'quis nostrud exercitation ullamco laboris',
				col5: 12.15,
				col6: -4,
				col7: false
			}
		],
		rows = 200,
		i,
		l = dataList.length;

	for (i = 0; i < rows; i++) {
		data.items.push(lang.mixin({ id: i}, dataList[i % l]));
	}

	test.suite('OnDemandGrid', function () {
		test.afterEach(function () {
			if (grid && grid.destroy()) {
				grid = undefined;
			}
		});

		test.test('Should prune even rows', function () {
			var testStore = createSyncStore({data: data.items}),
				dfd = this.async(),
				resolve,
				count = 0,
				handle;

			grid = new OnDemandGrid({
				collection: testStore,
				columns: {
					id: 'id',
					col1: 'Column 1',
					col2: 'Column 2',
					col3: 'Column 3',
					col4: 'Column 4',
					col5: 'Column 5',
					col6: 'Column 6',
					col7: 'Column 7'
				},
				sort: 'id'
			});

			document.body.appendChild(grid.domNode);
			grid.domNode.style.height = '360px';
			grid.startup();

			aspect.after(grid, 'removeRow', function () {
				count += 1;
			});

			handle = aspect.after(grid, '_processScroll', dfd.rejectOnError(function () {
				handle.remove();
				assert.isTrue(count > 0);
				assert.strictEqual(count % 2, 0);
				count = 0;

				handle = aspect.after(grid, '_processScroll', dfd.callback(function(){
					handle.remove();
					assert.isTrue(count > 0);
					assert.strictEqual(count % 2, 0);
				}));

				grid.scrollTo({y: 7000});
			}));

			grid.scrollTo({y: 4001});
		});
	});
});
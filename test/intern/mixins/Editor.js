define([
	'intern!tdd',
	'intern/chai!assert',
	'dojo/_base/declare',
	'dojo/aspect',
	'dojo/Deferred',
	'dojo/on',
	'dojo/promise/all',
	'dojo/query',
	'dojo/when',
	'dijit/registry',
	'dijit/form/TextBox',
	'dgrid/Grid',
	'dgrid/OnDemandGrid',
	'dgrid/Editor',
	'dgrid/test/data/createSyncStore',
	'dgrid/test/data/orderedData',
	'dstore/Memory'
], function (test, assert, declare, aspect, Deferred, on, all, query, when, registry, TextBox,
		Grid, OnDemandGrid, Editor, createSyncStore, orderedData, Memory) {

	var testOrderedData = orderedData.items,
		EditorGrid = declare([Grid, Editor]),
		SelectTestGrid = declare([OnDemandGrid, Editor]),
		grid,
		optionsData = [
			{id: "1", name: "one"},
			{id: "2", name: "two"},
			{id: "3", name: "three"},
			{id: "4", name: "four"},
			{id: "5", name: "five"}
		],
		optionsStore = new Memory({data: optionsData}),
		selectTestData = [
			{id: 1, "value": "1"},
			{id: 2, "value": "2"},
			{id: 3, "value": "3"},
			{id: 4, "value": "4"},
			{id: 5, "value": "5"}
		];

	function testSelectValue(select) {
		// test value of the select
		assert.strictEqual(select[0].value, "1", "Select 1 should have value '1'");
		assert.strictEqual(select[1].value, "2", "Select 2 should have value '2'");
		assert.strictEqual(select[2].value, "3", "Select 3 should have value '3'");
		assert.strictEqual(select[3].value, "4", "Select 4 should have value '4'");
		assert.strictEqual(select[4].value, "5", "Select 5 should have value '5'");
	}
	function testOption(option) {
		// test options label
		assert.strictEqual(option[0].label, "one", "Option 1 label should be 'one'");
		assert.strictEqual(option[1].label, "two", "Option 2 label should be 'two'");
		assert.strictEqual(option[2].label, "three", "Option 3 label should be 'three'");
		assert.strictEqual(option[3].label, "four", "Option 4 label should be 'four'");
		assert.strictEqual(option[4].label, "five", "Option 5 label should be 'five'");
		// test options value
		assert.strictEqual(option[0].value, "1", "Option 1 value should be '1'");
		assert.strictEqual(option[1].value, "2", "Option 2 value should be '2'");
		assert.strictEqual(option[2].value, "3", "Option 3 value should be '3'");
		assert.strictEqual(option[3].value, "4", "Option 4 value should be '4'");
		assert.strictEqual(option[4].value, "5", "Option 5 value should be '5'");
	}

	test.suite('Editor mixin', function () {

		test.afterEach(function () {
			if (grid) {
				grid.destroy();
			}
		});

		test.test('canEdit - always-on (instance-per-row) editor', function () {
			var results = {};
			var data = [
				{id: 1, data1: 'Data 1.a', data2: 'Data 2.a'},
				{id: 2, data1: 'Data 1.b', data2: 'Data 2.b'},
				{id: 3, data1: 'Data 1.c', data2: 'Data 2.c'}
			];
			grid = new EditorGrid({
				columns: [
					{
						field: 'data1',
						label: 'Data 1'
					},
					{
						editor: 'text',
						field: 'data2',
						label: 'Data 2',
						canEdit: function (object, value) {
							results[object.id] = value;
						}
					}
				]
			});
			document.body.appendChild(grid.domNode);
			grid.startup();
			grid.renderArray(data);

			assert.strictEqual(results[1], 'Data 2.a',
				'canEdit should have been called (item 1)');
			assert.strictEqual(results[2], 'Data 2.b',
				'canEdit should have been called (item 2)');
			assert.strictEqual(results[3], 'Data 2.c',
				'canEdit should have been called (item 3)');
		});

		test.test('canEdit - editOn (shared) editor', function () {
			var results = {};
			var data = [
				{id: 1, data1: 'Data 1.a', data2: 'Data 2.a'},
				{id: 2, data1: 'Data 1.b', data2: 'Data 2.b'},
				{id: 3, data1: 'Data 1.c', data2: 'Data 2.c'}
			];
			grid = new EditorGrid({
				columns: [
					{
						field: 'data1',
						label: 'Data 1',
						id: 'data1'
					},
					{
						editor: TextBox,
						editOn: 'click',
						field: 'data2',
						label: 'Data 2',
						id: 'data2',
						canEdit: function (object, value) {
							results[object.id] = value;
						}
					}
				]
			});
			document.body.appendChild(grid.domNode);
			grid.startup();
			grid.renderArray(data);

			assert.isUndefined(results[1],
				'canEdit should not have been called yet for editOn editor (item 1)');
			assert.isUndefined(results[2],
				'canEdit should not have been called yet for editOn editor (item 2)');
			assert.isUndefined(results[3],
				'canEdit should not have been called yet for editOn editor (item 3)');

			// Note: The "Data 2" column's canEdit method always returns false so none of the following
			// grid.edit calls will return a promise and no editor will receive focus.
			grid.edit(grid.cell(1, 'data2'));
			assert.isUndefined(results[1],
				'canEdit should not have been called yet for editOn editor (item 1)');
			assert.strictEqual(results[2], 'Data 2.b',
				'canEdit should have been called for editOn editor (item 2)');
			assert.isUndefined(results[3],
				'canEdit should not have been called yet for editOn editor (item 3)');

			grid.edit(grid.cell(0, 'data2'));
			assert.strictEqual(results[1], 'Data 2.a',
				'canEdit should have been called for editOn editor (item 1)');
			assert.strictEqual(results[2], 'Data 2.b',
				'canEdit should have been called for editOn editor (item 2)');
			assert.isUndefined(results[3],
				'canEdit should not have been called yet for editOn editor (item 3)');

			grid.edit(grid.cell(2, 'data2'));
			assert.strictEqual(results[1], 'Data 2.a',
				'canEdit should have been called for editOn editor (item 1)');
			assert.strictEqual(results[2], 'Data 2.b',
				'canEdit should have been called for editOn editor (item 2)');
			assert.strictEqual(results[3], 'Data 2.c',
				'canEdit should have been called for editOn editor (item 3)');
		});

		test.test('canEdit always-on editor - suppress on false', function () {
			var rowCount,
				cell,
				matchedNodes,
				dfd = this.async();

			function canEdit(data) {
				return data.order % 2;
			}

			grid = new EditorGrid({
				columns: {
					order: 'step',
					name: {
						editor: 'text',
						label: 'Name',
						canEdit: canEdit
					},
					description: {
						editor: 'text',
						label: 'Description',
						editOn: 'click',
						canEdit: canEdit
					}
				}
			});

			document.body.appendChild(grid.domNode);
			grid.startup();
			grid.renderArray(testOrderedData);
			rowCount = testOrderedData.length;

			function testRow(rowIndex) {
				cell = grid.cell(rowIndex, 'name');
				when(grid.edit(cell)).then(dfd.rejectOnError(function () {
					matchedNodes = query('input', cell.element);
					if (canEdit(cell.row.data)) {
						assert.strictEqual(1, matchedNodes.length,
							'Cell with canEdit=>true should have an editor element');
					}
					else {
						assert.strictEqual(0, matchedNodes.length,
							'Cell with canEdit=>false should not have an editor element');
					}
					rowIndex++;
					if (rowIndex < rowCount) {
						testRow(rowIndex);
					}
					else {
						dfd.resolve();
					}
				}));
			}
			testRow(0);

			return dfd;
		});

		test.test('canEdit edit-on click editor - suppress on false', function () {
			var rowCount,
				cell,
				matchedNodes,
				dfd = this.async();

			function canEdit(data) {
				return data.order % 2;
			}

			grid = new EditorGrid({
				columns: {
					order: 'step',
					name: {
						editor: 'text',
						label: 'Name',
						canEdit: canEdit
					},
					description: {
						editor: 'text',
						label: 'Description',
						editOn: 'click',
						canEdit: canEdit
					}
				}
			});

			document.body.appendChild(grid.domNode);
			grid.startup();
			grid.renderArray(testOrderedData);
			rowCount = testOrderedData.length;

			function testRow(rowIndex) {
				cell = grid.cell(rowIndex, 'description');
				when(grid.edit(cell)).then(dfd.rejectOnError(function () {
					matchedNodes = query('input', cell.element);
					if (canEdit(cell.row.data)) {
						assert.strictEqual(1, matchedNodes.length,
							'Cell with canEdit=>true should have an editor element');
					}
					else {
						assert.strictEqual(0, matchedNodes.length,
							'Cell with canEdit=>false should not have an editor element');
					}
					rowIndex++;
					if (rowIndex < rowCount) {
						testRow(rowIndex);
					}
					else {
						dfd.resolve();
					}
				}));
			}
			testRow(0);

			return dfd;
		});

		test.test('destroy editor widgets - native', function () {
			var matchedNodes;

			matchedNodes = query('input');
			assert.strictEqual(0, matchedNodes.length,
				'Before grid is created there should be 0 input elements on the page');

			grid = new EditorGrid({
				columns: {
					order: 'step',
					name: {
						label: 'Name',
						editor: 'text'
					},
					description: {
						label: 'Description',
						editor: 'text',
						editOn: 'click'
					}
				}
			});
			document.body.appendChild(grid.domNode);
			grid.startup();
			grid.renderArray(testOrderedData);

			matchedNodes = query('input');
			assert.strictEqual(testOrderedData.length, matchedNodes.length,
					'There should be ' + testOrderedData.length + ' input elements for the grid\'s editors');

			grid.destroy();

			matchedNodes = query('input');
			assert.strictEqual(0, matchedNodes.length,
				'After grid is destroyed there should be 0 input elements on the page');
		});

		test.test('destroy editor widgets - Dijit', function () {
			assert.strictEqual(0, registry.length,
				'Before grid is created there should be 0 widgets on the page');

			grid = new EditorGrid({
				columns: {
					order: 'step',
					name: {
						label: 'Name',
						editor: TextBox
					},
					description: {
						label: 'Description',
						editor: TextBox,
						editOn: 'click'
					}
				}
			});
			document.body.appendChild(grid.domNode);
			grid.startup();
			grid.renderArray(testOrderedData);

			// Expected is data length + 1 due to widget for editOn editor
			assert.strictEqual(testOrderedData.length + 1, registry.length,
					'There should be ' + (testOrderedData.length + 1) + ' widgets for the grid\'s editors');

			grid.destroy();

			assert.strictEqual(0, registry.length,
				'After grid is destroyed there should be 0 widgets on the page');
		});

		test.test('editor widget startup called at appropriate time', function () {
			var assertionMessage;
			var AssertionTextBox = declare(TextBox, {
				startup: function () {
					if (this._started) {
						return;
					}
					assert.isTrue(this.domNode.offsetHeight > 0,
						assertionMessage + ': startup should not be called before widgets are in flow');
					this.inherited(arguments);
				}
			});

			grid = new (declare([OnDemandGrid, Editor]))({
				columns: {
					order: 'step',
					name: {
						label: 'Name',
						editor: AssertionTextBox
					},
					description: {
						label: 'Description',
						editor: AssertionTextBox,
						editOn: 'click'
					}
				},
				collection: createSyncStore({
					data: testOrderedData,
					idProperty: 'order'
				})
			});
			document.body.appendChild(grid.domNode);

			assertionMessage = 'always-on';
			grid.startup();

			// Assertions will automatically run for always-on editor;
			// test activating an editOn editor and also test updating a row
			assertionMessage = 'editOn + edit()';
			grid.edit(grid.cell(1, 'description'));
			assertionMessage = 'editOn + Trackable';
			grid.collection.put(grid.collection.getSync(2));
		});

		test.test('editor focus with always-on editor', function () {
			var rowCount,
				cell,
				cellEditor,
				dfd = this.async();

			grid = new EditorGrid({
				columns: {
					order: 'step',
					name: {
						label: 'Name',
						editor: 'text'
					},
					description: {
						label: 'Description',
						editor: 'text',
						editOn: 'click'
					}
				}
			});
			document.body.appendChild(grid.domNode);
			grid.startup();
			grid.renderArray(testOrderedData);
			rowCount = testOrderedData.length;

			function testRow(rowIndex) {
				// Test calling 'grid.edit()' in an always-on cell
				cell = grid.cell(rowIndex, 'name');
				grid.edit(cell).then(dfd.rejectOnError(function (node) {
					cellEditor = query('input', cell.element)[0];
					assert.strictEqual(cellEditor, node,
						'edit method\'s promise should return the active editor');
					assert.strictEqual(cellEditor, document.activeElement,
						'Editing a cell should make the cell\'s editor active');
					rowIndex++;
					if (rowIndex < rowCount) {
						testRow(rowIndex);
					}
					else {
						dfd.resolve();
					}
				}));
			}
			testRow(0);

			return dfd;
		});

		test.test('editor focus and show event with edit-on click editor', function () {
			var rowCount,
				cell,
				cellEditor,
				dfd = this.async();

			grid = new EditorGrid({
				columns: {
					order: 'step',
					name: {
						label: 'Name',
						editor: 'text'
					},
					description: {
						label: 'Description',
						editor: 'text',
						editOn: 'click'
					}
				}
			});
			document.body.appendChild(grid.domNode);
			grid.startup();
			grid.renderArray(testOrderedData);
			rowCount = testOrderedData.length;

			function testRow(rowIndex) {
				var dfdEvent = new Deferred();
				// Test calling 'grid.edit()' in an always-on cell
				cell = grid.cell(rowIndex, 'description');
				// Respond to the "dgrid-editor-show" event to ensure the
				// correct cell has an editor.  This event actually fires
				// synchronously, so we don't need to use this.async.
				on.once(grid, 'dgrid-editor-show', dfd.rejectOnError(function (event) {
					assert.strictEqual(cell.element, event.cell.element,
						'The activated cell should be being edited'
					);
					dfdEvent.resolve();
				}));
				// Don't move on to the next row until the editor has received focus and the show event has fired.
				all([grid.edit(cell), dfdEvent]).then(dfd.rejectOnError(function () {
					cellEditor = query('input', cell.element)[0];
					assert.strictEqual(cellEditor, document.activeElement,
						'Editing a cell should make the cell\'s editor active');
					rowIndex++;
					if (rowIndex < rowCount) {
						testRow(rowIndex);
					}
					else {
						dfd.resolve();
					}
				}));
			}
			testRow(0);

			return dfd;
		});

		test.test('select - editOn - true', function () {
			var option,
				select;
			grid = new SelectTestGrid({
				collection: new Memory({ data: selectTestData }),
				columns: {
					value: {
						editor: "select",
						editorArgs: { store: optionsStore, optionValueField: 'id', optionLabelField: 'name' }
					}
				}
			});

			document.body.appendChild(grid.domNode);
			grid.startup();
			select = query('select', grid.domNode);
			option = query('option', grid.domNode);
			assert.strictEqual(select.length, 5, "should have select type");
			assert.strictEqual(option.length, 25, "should have option");
			testSelectValue(select);
		});

		test.test('select - editOn - false', function () {
			var option,
				select;
			grid = new SelectTestGrid({
				collection: new Memory({ data: selectTestData }),
				columns: {
					value: {
						editor: "select",
						editOn: "click",
						editorArgs: { store: optionsStore, optionValueField: 'id', optionLabelField: 'name' }
					}
				}
			});

			document.body.appendChild(grid.domNode);
			grid.startup();
			grid.edit(grid.cell(1, "value"));
			select = query('select', grid.domNode);
			option = query('option', grid.domNode);
			assert.strictEqual(select.length, 1, "should have select type");
			assert.strictEqual(option.length, 5, "should have option");
			// test value of the select
			assert.strictEqual(select[0].value, "1", "Select 1 should have value '1'");
			testOption(option);
		});

		test.test('select - options - with arguments', function () {
			var option,
				select,
				optionsData = [
					{unique: "1", random: "one"},
					{unique: "2", random: "two"},
					{unique: "3", random: "three"},
					{unique: "4", random: "four"},
					{unique: "5", random: "five"}
				],
				optionsStore = new Memory({data: optionsData, idProperty: 'unique'}),
				selectTestData = [
					{id: 1, "value": "1"},
					{id: 2, "value": "2"},
					{id: 3, "value": "3"},
					{id: 4, "value": "4"},
					{id: 5, "value": "5"}
				];
			grid = new SelectTestGrid({
				collection: new Memory({ data: selectTestData }),
				columns: {
					value: {
						editor: "select",
						editorArgs: { store: optionsStore, optionValueField: 'unique', optionLabelField: 'random' }
					}
				}
			});

			document.body.appendChild(grid.domNode);
			grid.startup();
			select = query('select', grid.domNode);
			option = query('option', grid.domNode);
			assert.strictEqual(select.length, 5, "should have select type");
			assert.strictEqual(option.length, 25, "should have option");
			testSelectValue(select);
			testOption(option);
		});

		test.test('select - value should start with the initial value', function () {
			grid = new SelectTestGrid({
				collection: new Memory({ data: selectTestData }),
				columns: {
					value: {
						editor: "select",
						editOn: "click",
						editorArgs: { store: optionsStore, optionValueField: 'id', optionLabelField: 'name' }
					}
				}
			});

			document.body.appendChild(grid.domNode);
			grid.startup();
			// Display the correct initial value
			assert.strictEqual(grid.cell(1, "value").element.innerHTML, selectTestData[0].value, "Row 1 should contain the value '1'");
			assert.strictEqual(grid.cell(2, "value").element.innerHTML, selectTestData[1].value, "Row 2 should contain the value '2'");
			assert.strictEqual(grid.cell(3, "value").element.innerHTML, selectTestData[2].value, "Row 3 should contain the value '3'");
			assert.strictEqual(grid.cell(4, "value").element.innerHTML, selectTestData[3].value, "Row 4 should contain the value '4'");
			assert.strictEqual(grid.cell(5, "value").element.innerHTML, selectTestData[4].value, "Row 5 should contain the value '5'");
		});

		test.test('select - value should change when edit', function () {
			var cell, select;
			grid = new SelectTestGrid({
				collection: new Memory({ data: selectTestData }),
				columns: {
					value: {
						editor: "select",
						editOn: "click",
						editorArgs: { store: optionsStore, optionValueField: 'id', optionLabelField: 'name' }
					}
				}
			});

			document.body.appendChild(grid.domNode);
			grid.startup();
			// After editing the value should change
			cell = grid.cell(1, "value");
			grid.edit(cell);
			select = query('select', cell.domNode)[0];
			select.selectedIndex = 1; // value 2
			// Changing the select doesn't get change when off focus so I change the collection to make sure the data get update
			grid.collection.get(1).then(function (item) {
				item.value = 2;
				grid.collection.put(item).then(function () {
					grid.save();
					grid.refresh();
				});
			});
			assert.strictEqual(grid.cell(1, "value").element.innerText, "2", "Row 1 should contain the value '2'");
		});
	});
});

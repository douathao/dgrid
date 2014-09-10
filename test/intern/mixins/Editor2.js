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
	'dojo/store/Memory',
	'dstore/Memory',
	'put-selector/put'
], function (test, assert, declare, aspect, Deferred, on, all, query, when, registry, TextBox,
		Grid, OnDemandGrid, Editor, createSyncStore, orderedData, LegacyMemory, Memory, put) {

	var testOrderedData = orderedData.items,
		EditorGrid = declare([Grid, Editor]),
		grid,
		optionsData = [
			{id: "1", name: "one"},
			{id: "2", name: "two"},
			{id: "3", name: "three"},
			{id: "4", name: "four"},
			{id: "5", name: "five"}
		],
		optionsStore = new LegacyMemory({ data: optionsData }),
		selectTestData = [
			{id: 1, "value": "1"},
			{id: 2, "value": "2"},
			{id: 3, "value": "3"},
			{id: 4, "value": "4"},
			{id: 5, "value": "5"}
		];

	test.suite('Editor mixin', function () {

		test.afterEach(function () {
//			if (grid) {
//				grid.destroy();
//			}
		});

		test.test('Select - editOn - true', function () {
			var option,
				select;
			grid = new EditorGrid({
				columns: {
					value: {
						editor: "select",
						editorArgs: { store: optionsStore}
					}
				}
			});

			document.body.appendChild(grid.domNode);
			grid.startup();
			grid.renderArray(selectTestData);
			select = query('select');
			option = query('option');
			assert.strictEqual(select.length, 5, "should have select type");
			assert.strictEqual(option.length, 25, "should have option");
			grid.destroy();

		});

		test.test('Select - editOn - false', function () {
			var option,
				select;
			grid = new EditorGrid({
				columns: {
					value: {
						editor: "select",
						editOn: "click",
						editorArgs: { store: optionsStore}
					}
				}
			});

			document.body.appendChild(grid.domNode);
			grid.startup();
			grid.renderArray(selectTestData);
			grid.edit(grid.cell(0, "value"));
			select = query('select');
			option = query('option');
			assert.strictEqual(select.length, 1, "should have select type");
			assert.strictEqual(option.length, 5, "should have option");
			grid.destroy();

		});
		test.test('select - value should start with the initial value', function () {
			grid = new (declare([OnDemandGrid, Editor]))({
				collection: new Memory({ data: selectTestData }),
				columns: {
					value: {
						editor: "select",
						editOn: "click",
						editorArgs: { store: optionsStore}
					}
				}
			});

			document.body.appendChild(grid.domNode);
			grid.startup();
			// Display the correct initial value
			assert.strictEqual(grid.cell(1, "value").element.innerText, selectTestData[0].value, "Row 1 should contain the value '1'");
			assert.strictEqual(grid.cell(2, "value").element.innerText, selectTestData[1].value, "Row 2 should contain the value '2'");
			assert.strictEqual(grid.cell(3, "value").element.innerText, selectTestData[2].value, "Row 3 should contain the value '3'");
			assert.strictEqual(grid.cell(4, "value").element.innerText, selectTestData[3].value, "Row 4 should contain the value '4'");
			assert.strictEqual(grid.cell(5, "value").element.innerText, selectTestData[4].value, "Row 5 should contain the value '5'");
			grid.destroy();
		});

		test.test('select - value should change when edit', function () {
			var cell, button, select;
			grid = new (declare([OnDemandGrid, Editor]))({
				collection: new Memory({ data: selectTestData }),
				columns: {
					value: {
						editor: "select",
						editOn: "click",
						editorArgs: { store: optionsStore}
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

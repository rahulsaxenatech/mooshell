/*
 * Define actions on the run/save/clean buttons
 */
var MooShellActions = new Class({
	Implements: [Options, Events],
	options: {
		// onRun: $empty,
		// onClean: $empty,
		formId: 'show-result',
		saveAndReloadId: 'update',
		saveAsNewId: 'savenew',
		runId: 'run',
		cleanId: 'clean',
		entriesSelector: 'textarea',
		resultLabel: 'result_label',
		resultInput: 'select_link',
		exampleURL: '',
		exampleSaveURL: '',
		loadDependenciesURL: ''
	},
	/*
	 * Assign actions
	 */
	initialize: function(options) {
		this.setOptions(options);
		if ($(this.options.saveAndReloadId)) 
			$(this.options.saveAndReloadId).addEvent('click', this.saveAndReload.bind(this));
		if ($(this.options.saveAsNewId)) 
			$(this.options.saveAsNewId).addEvent('click', this.saveAsNew.bind(this));
		if ($(this.options.runId)) 
			$(this.options.runId).addEvent('click', this.run.bind(this));
		if ($(this.options.cleanId)) 
			$(this.options.cleanId).addEvent('click', this.cleanEntries.bind(this));
		// actions run if shell loaded
		
		this.form = document.id(this.options.formId);
		
		if (this.options.exampleURL) {
		//	this.run();
			this.displayExampleURL();
		}
	},
	// mark shell as favourite
	makeFavourite: function(shell_id) {
		new Request.JSON({
			'url': makefavouritepath,
			'data': {shell_id: shell_id},
			'onSuccess': function(response) {
				// reload page after successful save
				// var p = $('mark_favourite').getParent('p').empty();
				// p.appendText(response.message);
				$('mark_favourite').addClass('isFavourite')
					.getElements('span')[0].set('text', 'Base');
			}
		}).send();
	
	},
	// save and create new pastie
	saveAsNew: function() {
		Layout.updateFromMirror();
		$('id_slug').value='';
		$('id_version').value='0';
		new Request.JSON({
			'url': this.options.exampleSaveUrl,
			'onSuccess': function(json) {
				if (!json.error) {
					// reload page after successful save
					window.location = json.pastie_url_relative; 
				} else {
					alert('ERROR: ' + json.error);
				}
			}
		}).send(this.form);
	},
	// update existing (create shell with new version)
	saveAndReload: function() {
		Layout.updateFromMirror();
		new Request.JSON({
			'url': this.options.exampleSaveUrl,
			'onSuccess': function(json) {
				// reload page after successful save
				window.location = json.pastie_url_relative; 
			}
		}).send(this.form);
	},
	// run - submit the form (targets to the iframe)
	run: function() { 
		Layout.updateFromMirror();
		document.id(this.options.formId).submit();
		this.fireEvent('run');
	},
	// clean all entries, rename example to default value
	cleanEntries: function () {
		// here reload Mirrors
		Layout.cleanMirrors();
		$$(this.options.entriesSelector).each( function(t) {t.value='';});
		if (this.resultText) {
			document.id(this.options.resultLabel).set('text', this.resultText);
		}
		if ($(this.options.saveAndReloadId)) $(this.options.saveAndReloadId).destroy();
 		this.fireEvent('clean');
	},
	// rename iframe label to present the current URL
	displayExampleURL: function() {
		/*
		var label = document.id(this.options.resultLabel)
		if (label) {
			this.resultText = label.get('text');
			label.appendText(': ');
			new Element('a',{
				href: this.options.exampleURL,
				text: this.options.exampleURL
			}).inject(label)
		}*/
		var resultInput = document.id(this.options.resultInput);
		if (resultInput) {
			if (Browser.Engine.gecko) {
				resultInput.setStyle('padding-top', '4px');
			}
			// resultInput.select();
		}
	},
	loadLibraryVersions: function(group_id) {
		new Request.JSON({
			url: this.options.loadLibraryVersionsURL.substitute({group_id: group_id}),
			onSuccess: function(response) {
				$('js_lib').empty();
				$('js_dependency').empty();
				response.libraries.each( function(lib) {
					new Element('option', {
						value: lib.id,
						text: "{group_name} {version}".substitute(lib)
					}).inject($('js_lib'));
					if (lib.selected) $('js_lib').set('value',lib.id);
				});
				response.dependencies.each(function (dep) {
					new Element('li', {
						html: [
							"<input id='dep_{id}' type='checkbox' name='js_dependency[{id}]' value='{id}'/>",
							"<label for='dep_{id}'>{name}</label>"
							].join('').substitute(dep)
					}).inject($('js_dependency'));
					if (dep.selected) $('dep_'+dep.id).set('checked', true);
				});
			}
		}).send();
	},
	loadDependencies: function(lib_id) {
		new Request.JSON({
			url: this.options.loadDependenciesURL.substitute({lib_id: lib_id}),
			onSuccess: function(response) {
				$('js_dependency').empty();
				response.each(function (dep) {
					new Element('li', {
						html: [
							"<input id='dep_{id}' type='checkbox' name='js_dependency[{id}]' value='{id}'/>",
							"<label for='dep_{id}'>{name}</label>"
							].join('').substitute(dep)
					}).inject($('js_dependency'));
					if (dep.selected) $('dep_'+dep.id).set('checked', true);
				});
			}
		}).send();
	}
});

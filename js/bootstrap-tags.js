(function($) {
	"use strict";

	var defaults = {
		values: [],
		values_url: "",

		templates: {
			pill: '<span class="badge badge-info badge-pill tag-badge p-3 mr-2">{0}</span>',
			add_pill: '<span class="badge badge-success badge-pill p-2 tag-badge">...</span>',
			input_pill: '<div class="d-none input-group mt-2" style="min-width:200px"></div>',
			number: " <sup><small>{0}</small></sup>",
			plus_icon: '<i class="icon icon-plus"></i>',
			delete_icon: '<i class="ml-2 icon icon-cancel"></i>',
			ok_icon: '<div class="input-group-append"><span class="input-group-text"><i class="icon icon-ok"></i></span></div>',
			input: '<input data-provide="typeahead" class="tag-input typeahead form-control" autocomplete="off" type="text">'
		},
		
		limit: 0,

		tag_link_target: "", // may be _blank or other.

		can_delete: true,
		can_add: true,

		double_hilight: "#0B3549",

		input_name: "tags[]",

		lang: {
			delete: "Delete",
			limit: "You have reached limit of only {0} tags to be added."
		},
		placeholder: 'Type to search...',

		suggestion_limit: 15,
		suggestion_url: "",
		suggestions: [],

		only_suggestions: false,

		remove_url: "",

		onLoadDefaults: function(values) {
			return values;
		},
		onRemove: function(pill) {},
		onError: function(num, msg) {
			alert(msg);
		},
		onBeforeAdd: function(pill, value) {
			return pill;
		},
		onLoadSuggestions: function(values) {
			return values;
		},
		onDuplicate: null,
		onBeforeRemove: function(pill) {
			return true;
		}
	};

	function Tags(context, params) {
		this.options = $.extend(true, {}, defaults, params);

		var $self = this;

		if ($self.options.values_url) {
			$.ajax({
				dataType: "json",
				async: false,
				url: $self.options.values_url
			}).done(function(json) {
				if (typeof json == "object") {
					$self.options.values = $.merge($self.options.values, json);
				}
			});
		}
		$self.options.values = $self.options.onLoadDefaults($self.options.values);

		var pills_list = $(document.createElement("span"))
			.addClass("pills-list")
			.appendTo(context);

		$self.options.values = $self._prepare($self.options.values);
		$.each($self.options.values, function(key, value) {
			$self.addTag(pills_list, value);
		});

		if ($self.options.can_add) {
			// var labels = [],
			// 	mapped = [];

			var input = $($.parseHTML($self.options.templates.input))
				.attr({ placeholder: $self.options.placeholder })
				.typeahead({
					source: function(query, process) {
						var suggestions = $.merge([], $self.options.suggestions);

						if ($self.options.suggestion_url) {
							$.ajax({
								dataType: "json",
								async: false,
								url: $self.options.suggestion_url,
								data: { q: query, limit: $self.options.suggestion_limit }
							}).done(function(json) {
								if (typeof json == "object") {
									suggestions = $.merge(suggestions, json);
								}
							});
						}

						suggestions = $self._prepare(suggestions);
						suggestions = $self.options.onLoadSuggestions(suggestions);
						process(suggestions);
					},
					updater: function(item) {
						$self._addTag(pills_list, input, item);
					}
				});

			if ($self.options.only_suggestions == false) {
				input.keypress(function(e) {
					if (!$(this).val()) return;
					if (e.keyCode == 13) {
						$self._addTag(pills_list, $(this));
						return false;
					}
				});
			}

			var add = $($self.options.templates.input_pill)
				.append(input)
				.append(
					$($self.options.templates.ok_icon)
						.css("cursor", "pointer")
						.click(function(e) {
							e.stopPropagation();
							$self._addTag(pills_list, input);
							input.focus();
						})
				)
				.appendTo(context);

			var wait = $($self.options.templates.add_pill)
				.addClass("add-pill")
				.css("cursor", "pointer")
				.append(
					$(document.createElement("span"))
						.attr({})
						.addClass("tag-add")
						.append($self.options.templates.plus_icon)
				)
				.click(function() {
					add.removeClass('d-none');
					input.focus();
					var $this = $(this);
					$this.hide();

					setTimeout(function() {
						$("body").one("click", function() {
							add.addClass('d-none');
							$this.show();
						});
					}, 200);
				})
				.appendTo(context);
		}
	}

	Tags.prototype._prepare = function(values) {
		$.each(values, function(key, value) {
			if (!value) {
				delete values[key];
				return true;
			}
			if (typeof value == "string") {
				values[key] = { id: value, name: value, suggest: value };
			}
			values[key].suggest = values[key].suggest || values[key].name;
			values[key].url = value.url || "";
			values[key].title = value.title || "";
			values[key].num = parseInt(value.num || "0");
		});
		return values;
	};
	Tags.prototype._addTag = function(pills_list, input, value) {
		if (!value) {
			value = this._prepare([input.val()])[0];
		}

		if (this.addTag(pills_list, value)) {
			input.val("").focus();
		}
	};
	Tags.prototype.addTag = function(pills_list, value) {
		var $self = this;

		if (!value) return false;

		if (parseInt($self.options.limit) > 0 && pills_list.children().length >= parseInt($self.options.limit)) {
			$self.options.onError(10, $self.options.lang.limit.format($self.options.limit));
			return false;
		}

		if (typeof value.id === "undefined" || typeof value.name === "undefined") {
			$self.options.onError(11, "Not correct object format to create tag/pill");
			$.error("Not correct object format to create tag/pill");
		}

		var unique = "";
		$.each(pills_list.children(), function(key, val) {
			if (
				value.id.toString().toLowerCase() ==
				$(val)
					.data("tag-id")
					.toString()
					.toLowerCase()
			) {
				unique = $(val);
				return false;
			}
		});

		if (unique) {
			if (!$self.options.onDuplicate) {
				var color = $(pills_list.children()[0]).css("background-color");
				unique.stop().animate({ backgroundColor: $self.options.double_hilight }, 100, "swing", function() {
					unique.stop().animate({ backgroundColor: color }, 100, "swing", function() {
						unique.css("background-color", "");
					});
				});
				return false;
			} else {
				if ($self.options.onDuplicate(unique, value) != true) {
					return false;
				}
			}
		}

		if (value.url) {
			var title = value.title ? ' data-toggle="tooltip" title="' + value.title + '"' : "";
			value.name =
				'<a class="tag-link" ' +
				title +
				' target="' +
				$self.options.tag_link_target +
				'" href="' +
				value.url +
				'">' +
				value.name +
				"</a>";
		}

		var icon = "";
		if ($self.options.can_delete) {
			icon = $(document.createElement("a"))
				.attr({
					href: "javascript:void(0)",
					class: "tag-remove"
				})
				.html($self.options.templates.delete_icon.toString())
				.click(function() {
					$self.removeTag(this);
				});
		}

		var num = value.num > 0 ? $self.options.templates.number.format(value.num) : "";

		var tag = $($self.options.templates.pill.format(value.name))
			.attr("data-tag-id", value.id)
			.append(
				num,
				icon,
				$(document.createElement("input")).attr({
					"data-tag-hidden": value.id,
					name: $self.options.input_name,
					type: "hidden",
					value: value.id
				})
			)
			.css({
				//overflow: "hidden",
				//"white-space": "nowrap"
			});

		tag = $self.options.onBeforeAdd(tag, value);

		pills_list.append(tag);

		$('[data-toggle="tooltip"]').tooltip();

		return true;
	};

	Tags.prototype.removeTag = function(tag) {
		var $self = this;
		var $tag = $(tag).closest("[data-tag-id]");

		if ($self.options.onBeforeRemove($tag) === false) {
			return;
		}

		$tag.remove();
		if ($self.options.remove_url) {
			$.ajax({
				dataType: "json",
				async: false,
				url: $self.options.remove_url,
				data: { id: $tag.data("tag-id") }
			});
		}
	};

	$.fn.tags = function(params) {
		return this.each(function() {
			new Tags($(this), params);
		});
	};
})(window.jQuery);

if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != "undefined" ? args[number] : match;
		});
	};
}

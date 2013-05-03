;
(function($) {
    "use strict";

    var defaults = {
        values: [],
        values_url: '',

        templates: {
            pill: '<span class="badge badge-info badge-tag">{0}</span>',
            add_pill: '<span class="badge badge-success badge-tag"></span>',
            number: ' <sup><small>{0}</small></sup>',
            plus_icon: '<i class="icon-plus-sign tag-icon"></i>',
            delete_icon: '<i class="icon-remove-sign tag-icon"></i>',
            ok_icon: '<i class="icon-ok-sign tag-icon"></i>'
        },

        limit: 0,

        tag_link_target: '', // may be _blank or other.

        can_delete: true,
        can_add: true,

        double_hilight: '#0B3549',

        input_name: 'tags[]',

        lang: {
            delete: "Delete",
            limit: "You have reached limit of only {0} tags to be added."
        },

        suggestion_limit: 15,
        suggestion_url: '',
        suggestions: [],

        only_suggestions: false,

        remove_url: '',

        onLoadDefaults: function(values) {
            return values;
        },
        onRemove: function(pill) {
        },
        onError: function(num, msg) {
            alert(msg);
        },
        onBeforeAdd: function(pill, value) {
            return pill;
        },
        onLoadSuggestions: function(values) {
            return values;
        }
    }


    function Tags(context, params) {

        this.options = $.extend(true, {}, defaults, params);

        var $self = this;

        if($self.options.values_url) {
            $.ajax({
                dataType: 'json', type: 'get', async: false, url: $self.options.values_url
            }).done(function(json) {
                    if(typeof json == "object") {
                        $self.options.values = $.merge($self.options.values, json);
                    }
                });
        }
        $self.options.values = $self.options.onLoadDefaults($self.options.values);

        var pills_list = $(document.createElement('span')).addClass('pills-list').appendTo(context);

        $self.options.values = $self._prepare($self.options.values);
        $.each($self.options.values, function(key, value) {
            $self.addTag(pills_list, value);
        });

        if($self.options.can_add) {

            var labels = [], mapped = [];

            var input = $(document.createElement('input'))
                .addClass('tag-input')
                .attr({"autocomplete": "off"})
                .css('outline', 'none')
                .typeahead({
                    items: $self.options.suggestion_limit,
                    source: function(query, process) {

                        var suggestions = $self.options.suggestions;
                        labels = [];
                        mapped = {};

                        if($self.options.suggestion_url) {
                            $.ajax({
                                dataType: 'json', type: 'post', async: false, url: $self.options.suggestion_url,
                                data: {q: query, limit: $self.options.suggestion_limit}
                            }).done(function(json) {
                                    if(typeof json == "object") {
                                        suggestions = $.merge(suggestions, json);
                                    }
                                });
                        }

                        suggestions = $self.options.onLoadSuggestions(suggestions);
                        suggestions = $self._prepare(suggestions);

                        $.each(suggestions, function(i, item) {
                            mapped[item.html] = item
                            labels.push(item.html)
                        });

                        return labels;
                    },
                    updater: function(item) {
                        $self._addTag(pills_list, input, mapped[item]);
                    }
                })
                .click(function(e){
                    e.stopPropagation();
                });

            if($self.options.only_suggestions == false) {
                input.keyup(function(e) {
                    if(!$(this).val()) return;
                    if(e.keyCode == 13) {
                        $self._addTag(pills_list, $(this));
                    }
                });
            }

            var add = $($self.options.templates.add_pill)
                .append(input)
                .append($($self.options.templates.ok_icon)
                    .css('cursor', 'pointer')
                    .click(function(e) {
                        e.stopPropagation();
                        $self._addTag(pills_list, input);
                        input.focus();
                    })
                )
                .hide()
                .appendTo(context);

            var wait = $($self.options.templates.add_pill)
                .addClass('add-pill')
                .css('cursor', 'pointer')
                .html('...')
                .append($(document.createElement('span'))
                    .attr({})
                    .addClass('tag-add')
                    .append($self.options.templates.plus_icon)
                )
                .click(function() {
                    add.show();
                    input.focus();
                    var $this = $(this);
                    $this.hide();

                    setTimeout(function() {
                        $('body').one('click', function() {
                            add.hide();
                            $this.show();
                        });
                    }, 200);

                })
                .appendTo(context);
        }
    }


    Tags.prototype._prepare = function(values) {

        $.each(values, function(key, value) {
            if(!value) {
                delete values[key];
                return true;
            }
            if(typeof value == "string") {
                values[key] = {id: value, text: value, html: value};
            }
            values[key].html = values[key].html || values[key].text;
            values[key].url = value.url || '';
            values[key].title = value.title || '';
            values[key].num = parseInt(value.num || '0');
        });
        return values;
    }
    Tags.prototype._addTag = function(pills_list, input, value) {

        if(!value) {
            value = this._prepare([input.val()])[0];
        }

        if(this.addTag(pills_list, value)) {
            input.val('').focus();
        }
    }
    Tags.prototype.addTag = function(pills_list, value) {
        var $self = this;

        if(!value) return false;

        if(parseInt($self.options.limit) > 0 && pills_list.children().length >= parseInt($self.options.limit)) {
            $self.options.onError(10, $self.options.lang.limit.format($self.options.limit));
            return false;
        }

        if(!value.id || !value.text) {
            $self.options.onError(11, 'Not correct object format to create tag/pill');
            $.error('Not correct object format to create tag/pill');
        }

        var unique = '';
        $.each(pills_list.children(), function(key, val) {
            if(value.id.toString().toLowerCase() == $(val).data('tag-id').toString().toLowerCase()) {
                unique = $(val);
                return false;
            }
        });

        if(unique) {
            var color = $(pills_list.children()[0]).css('background-color');
            unique.stop().animate({"backgroundColor": $self.options.double_hilight}, 100, 'swing', function() {
                unique.stop().animate({"backgroundColor": color}, 100)
            });
            return false;
        }

        if(value.url) {
            var title = value.title ? ' data-toggle="tooltip" title="' + value.title + '"' : '';
            value.text = '<a class="tag-link" ' + title + ' target="' + $self.options.tag_link_target + '" href="' + value.url + '">' + value.text + '</a>';
        }

        var icon = '';
        if($self.options.can_delete) {
            icon = $(document.createElement('a'))
                .attr({
                    "href": "javascript:void(0)",
                    "class": "tag-remove",
                    "data-toggle": "tooltip",
                    "title": $self.options.lang.delete
                })
                .html($self.options.templates.delete_icon.toString())
                .click(function() {
                    $self.removeTag(this);
                });
        }

        var num = value.num > 0 ? $self.options.templates.number.format(value.num) : '';

        var tag = $($self.options.templates.pill.format(value.text))
            .attr('data-tag-id', value.id)
            .append(num, icon, $(document.createElement('input'))
                .attr({
                    "data-tag-hidden": value.id,
                    "name": $self.options.input_name,
                    "type": "hidden",
                    "value": value.id
                })
            );

        tag = $self.options.onBeforeAdd(tag, value);

        pills_list.append(tag);

        $('[data-toggle="tooltip"]').tooltip();

        return true;
    }

    Tags.prototype.removeTag = function(tag) {
        var $self = this;
        $(tag).closest('[data-tag-id]').animate({width: 0, "padding-right": 0, "padding-left": 0}, 200, 'swing', function() {
            var $this = $(this);
            if($self.options.remove_url) {
                $.ajax({
                    dataType: 'json', type: 'post', async: false, url: $self.options.remove_url, data: {id: $this.data('tag-id')}
                });
            }
            $self.options.onRemove($this);
            $this.remove();
        });
    }

    $.fn.tags = function(params) {
        return this.each(function() {
            new Tags($(this), params);
        })
    }
}(window.jQuery));

if(!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}
;
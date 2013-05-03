;
(function($) {
    "use strict";

    var defaults = {
        values: [],
        values_url: '',

        templates: {
            pill: '<span class="badge badge-info" data-tag-id="{1}">{0}</span>',
            delete_icon: '<i class="icon-remove-sign"></i>',
            number: ' <sup><small>{0}</small></sup>'
        },

        limit: 0,

        tag_link_target: '', // may be _blank or other.

        can_delete: true,
        can_add: true,

        input_name: 'tags[]',

        lang: {
            delete: "Delete",
            limit: "You have reached limit of only {0} tags to be added."
        },

        remove_url: '',

        onLoadDefaults: function(values) {
            return values;
        },
        onRemove: function(pill) {
        },
        onError: function(num, msg) {
            alert(msg);
        }

    };
    var options = {};

    function Tags(context) {
        var $self = this;

        if(options.values_url) {
            $.ajax({
                dataType: 'json', type: 'get', async: false, url: options.values_url
            }).done(function(json) {
                    if(typeof json == "object") {
                        options.values = $.merge(options.values, json);
                    }
                });
        }
        options.values = options.onLoadDefaults(options.values);

        var pills_list = $(document.createElement('div')).addClass('pills-list').appendTo(context);

        $.each(options.values, function(key, value) {
            $self.addTag(pills_list, value);
        });

        $('[data-toggle="tooltip"]').tooltip();
    }

    Tags.prototype.addTag = function(pills_list, value) {
        var $self = this;

        if(parseInt(options.limit) > 0 && pills_list.children().length >= parseInt(options.limit)) {
            options.onError(10, options.lang.limit.format(options.limit));
            return;
        }

        if(typeof value == "string") {
            value = {id: value, text: value, html: value};
        }
        value.html = value.html || value.text;
        value.url = value.url || '';
        value.title = value.title || '';
        value.num = parseInt(value.num || '0');

        if(!value.id || !value.text) {
            options.onError(11, 'Not correct object format to create tag/pill');
            $.error('Not correct object format to create tag/pill');
        }

        if(value.url) {
            var title = value.title ? ' data-toggle="tooltip" title="' + value.title + '"' : '';
            value.text = '<a class="tag-link" ' + title + ' target="' + options.tag_link_target + '" href="' + value.url + '">' + value.text + '</a>';
        }

        var icon = '';
        if(options.can_delete) {
            icon = $(document.createElement('a'))
                .attr({
                    "href": "javascript:void(0)",
                    "class": "tag-remove",
                    "data-toggle": "tooltip",
                    "title": options.lang.delete
                })
                .html(options.templates.delete_icon.toString())
                .click(function() {
                    $self.removeTag(this);
                });
        }

        var num = value.num > 0 ? options.templates.number.format(value.num) : '';

        var tag = $(options.templates.pill.format(value.text, value.id))
            .append(num, icon, $(document.createElement('input'))
                .attr({
                    "data-tag-hidden": value.id,
                    "name": options.input_name,
                    "type": "hidden",
                    "value": value.id
                })
            );

        pills_list.append(tag);
    }

    Tags.prototype.removeTag = function(tag) {
        $(tag).closest('[data-tag-id]').animate({width: 0, "padding-right": 0, "padding-left": 0}, 200, 'swing', function() {
            var $this = $(this);
            if(options.remove_url) {
                $.ajax({
                    dataType: 'json', type: 'post', async: false, url: options.remove_url, data: {id: $this.data('tag-id')}
                });
            }
            options.onRemove($this);
            $this.remove();
        });
    }

    $.fn.tags = function(params) {
        options = $.extend(true, {}, defaults, params);
        return this.each(function() {
            new Tags($(this));
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
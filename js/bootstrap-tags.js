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
        },
        onBeforeAdd: function(pill, value) {
            return pill;
        }

    };

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

        var pills_list = $(document.createElement('div')).addClass('pills-list').appendTo(context);

        $.each($self.options.values, function(key, value) {
            $self.addTag(pills_list, value);
        });

        $('[data-toggle="tooltip"]').tooltip();
    }

    Tags.prototype.addTag = function(pills_list, value) {
        var $self = this;

        if(parseInt($self.options.limit) > 0 && pills_list.children().length >= parseInt($self.options.limit)) {
            $self.options.onError(10, $self.options.lang.limit.format($self.options.limit));
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
            $self.options.onError(11, 'Not correct object format to create tag/pill');
            $.error('Not correct object format to create tag/pill');
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

        var tag = $($self.options.templates.pill.format(value.text, value.id))
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
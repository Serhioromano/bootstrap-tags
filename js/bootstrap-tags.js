;
(function ($) {
    "use strict";

    var defaults = {
        values: [],
        values_url: '',

        templates: {
            // {0} - text, {1} - id, {2} - delete icon
            pill: '<span class="badge badge-info" data-tag-id="{1}">{0}</span>',
            delete_icon: '<i class="icon-remove-sign"></i>'
        },

        can_delete: true,
        can_add: true,

        input_name: 'tags[]',

        lang: {
            delete: "Delete"
        },

        onLoadDefaults: function (values) {
            return values;
        }
    };
    var options = {};

    function Tags(context) {
        var $self = this;

        if (options.values_url) {
            $.ajax({
                dataType: 'json', type: 'get', async: false, url: options.values_url
            }).done(function (json) {
                    if (typeof json == "object") {
                        options.values = $.merge(options.values, json);
                    }
                });
        }
        options.values = options.onLoadDefaults(options.values);

        var pills_list = $(document.createElement('div')).appendTo(context);
        var hidden_list = $(document.createElement('div')).appendTo(context);

        $.each(options.values, function (key, value) {
            $self.addTag(pills_list, hidden_list, value);
        });

        $('[data-toggle="tooltip"]').tooltip();
    }

    Tags.prototype.addTag = function (pills_list, hidden_list, value) {
        var $self = this;

        if (typeof value == "string") {
            value = {id: value, text: value, html: value};
        }
        value.html = value.html || value.text;

        var icon = '';
        if(options.can_delete){
            icon = $(document.createElement('a'))
                .attr({
                    "data-toggle": "tooltip",
                    "title": options.lang.delete
                })
                .html(options.templates.delete_icon.toString())
                .click(function(){
                    $self.removeTag(this);
                });
        }

        var tag = $(options.templates.pill.format(value.text, value.id)).append(icon);


        pills_list.append(tag);
        hidden_list.append($(document.createElement('input')).attr({
            "data-tag-hidden": value.id,
            "name": options.input_name,
            "type": "hidden",
            "value": value.id
        }));
    }

    Tags.prototype.removeTag = function(tag) {
        $(tag).closest('[data-tag-id]').animate({width:0, padding:0}, 200, 'swing', function(){
            $(this).remove();
        });
    }

    $.fn.tags = function (params) {
        options = $.extend(true, {}, defaults, params);
        return this.each(function () {
            new Tags($(this));
        })
    }
}(window.jQuery));

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}
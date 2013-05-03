# Bootstrap Tags

In fact it is not tags it sort of mix of typeahead, and tags/pills. I just did not know how to name it in english, I named it after my task I did it to use in my application to manage tags.

Please see [demo](http://bootstrap-tags.azurewebsites.net/) here. Demo is updated automatically on every push to repository so it always contains latest version.

## Features

- Based on templates. Thus you can change any HTML markup of any element, and fully control how this UI components looks.
- Flexible API. There are few methods to make the same thing like pre-populate, remove or add tags/pills. you can use it as standard element with form submission or on fully AJAXed sites.

## Install

You can install with bower

    $> bower install bootstrap-tags-input

to see what files to use run

    $> bower list --path

## How to use

    <!DOCTYPE html>
    <html>
    <head>
        <title>Bootstrap tags - pills UI component</title>
        <link rel="stylesheet" href="components/bootstrap/docs/assets/css/bootstrap.css"/>
    </head>
    <body>
        <div id="bs-tags"></div>
    </div>

    <script type="text/javascript" src="components/jquery/jquery.js"></script>
    <script type="text/javascript" src="components/bootstrap/docs/assets/js/bootstrap.js"></script>
    <script type="text/javascript" src="js/bootstrap-tags.js"></script>
    <script type="text/javascript">
        $('#bs-tags').tags({});
    </script>
    </body>
    </html>

The minimal requirments are Bootstrap and jquery loaded and `bootstrap-tags.css`, `bootstrap-tags.js`.

## Feed format

As for default values or _typeahead_ suggestions the format is the same. It is an array of values. Values can be `string` or `object` or mixed.

    [
        {
            "id": "1",
            "text": "Apple",
            "html": "This is <b>Apple</b>!",
            "num": 5
        },
        {
            "id": "3",
            "text": "Mango",
            "html": "I like <b>Mango</b>!",
            "url": "/"
        },
        "Banana"
    ]

Object may contain following properties

Property | Required | Description
---------|----------|------------
id       | Yes      | Required only if object. If it is a string, the same value for `text` and `id` will be used.
text     | Yes      | Used as tag text.
html     | No       | If not set `text` will be used. This property is used to display in typeahead suggestions.
num      | No       | If set, number will be shown after the text.
url      | No       | If set, text will be as link. Not that there is `tag_link_target` option. Eg. `$('#bs-tags').tags({tag_link_target:"_blank"});`

## Options

You can use following options when construction element. Like `$('#bs-tags').tags(options);`

Option | Default | Description
-------|---------|------------
values | []      | Default values to pre-populate component with tags/pills
tag\_link\_target || Default target for tags/pills with links. To add link to tag you have to set `url` property in feed object. See _Feed format_ for details.
can_delete | true | Set if current user can delete tags/pills
can_add | true | Set if current users can add new tags
remove_url | | Set URL where `POST` request will be sent on tag/pill removal.
input_name | tags[] | Set name of the hidden `<input>` element to be added with every tag/pill. Ше should end with `[]` in order to support multiple values.
templates | | Set HTML markup. This let you fully manage and style output as you want. No limitations. See _Templates_ for more details. 

## Templates

Templates option allow you fully manage how tags/pills will look like. Then with additions of few CSS styles you may create very beautiful outputs. See demo for examples. 

You can path template through `templates` option.

	$('#bs-tags').tags({
		templates: {
			pill: '<span class="badge badge-info" data-tag-id="{1}">{0}</span>',
            delete_icon: '<i class="icon-remove-sign"></i>',
            number: ' <sup><small>{0}</small></sup>'
		}
	});
	
![pill template](http://serhioromano.s3.amazonaws.com/github/bs-tags/bs-tags-template.png)

Template | Default | Descritpion
---|---|---
pill | `<span class="badge badge-info" data-tag-id="{1}">{0}</span>` | This is main HTML element of the pill. This is also what will be passed to `onRemove(pill)` method. After full pill creation it will include also hidden `<input>`, number if passed and remove icon. `{0}` is the tag text, `{1}` is the tag id. `data-tag-id` is required attribute.
number |  `<sup><small>{0}</small></sup>` | If `num` property exists in _feed_ then number will be added. This is template how to format it.
delete_icon | `<i class="icon-remove-sign"></i>` | This is delete icon. If you use FontAwesome or IcoMoon you can change it to display better icon. 


Final pill may look like this.

	<span class="badge badge-info" data-tag-id="2">
		<a class="tag-link" target="" href="http://tags/">Apple</a> 
		<sup><small>5</small></sup>
		<a href="javascript:void(0)" class="tag-remove" data-toggle="tooltip" title="Delete">
			<i class="icon-remove-sign"></i>
		</a>
		<input data-tag-hidden="2" name="tags[]" type="hidden" value="2">
	</span>

## Events

Event          | Description
---------------|-------------
onLoadDefaults | Triggered before render element. What you return will be used to pre-populate component with tags/pills   
onRemove       | Triggered before removing HTML element of tag/pill.

        templates: {
            // {0} - text, {1} - id, {2} - delete icon
            pill: '<span class="badge badge-info" data-tag-id="{1}">{0}</span>',
            delete_icon: '<i class="icon-remove-sign"></i>',
            number: ' <sup><small>{0}</small></sup>'
        },

        input_name: 'tags[]',

        lang: {
            delete: "Delete"
        },

        remove_url: '',


## Load default values

There are 3 methods to load default values or pre-populate tags/pills. Methods are listed in order of execution.

1. First method is to pass default values as `values` option.

        $('#bs-tags').tags({values:["banana", "apple"]});

2. Second method to provide URL where through `GET` it will fetch default values

        $('#bs-tags').tags({values_url:"urls/defaults.json"});

3. And last method is to use callback function

        $('#bs-tags').tags({
            onLoadDefaults:function(values){
                return $.merge(values,["apple", "banana"]);
            }
        });
    Here `values` contain already loaded values with previos methods.

Or you can use all methods at once. All values will be merged.

## Remove tag/pill

First there is `can_delete` option to allow or disallow tags removing.

    $('#bs-tags').tags({can_delete:true});

This will allow simply remove tag HTML element with hidden `<input>`. But if you want callback on the event you can use `onRemove(pill)` callback.

    $('#bs-tags').tags({
        can_delete: true,
        onRemove(pill) {
            // do something...
        }
    });

Where `pill` is an HTML element.

And another way to control removal, is to set special URL where `POST` request will be sent with `id` parameter.

    $('#bs-tags').tags({can_delete: true, remove_url: 'http://mysite.com/removetag.php'});


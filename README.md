# Bootstrap Tags

In fact it is not tags it sort of mix of typeahead, and pills. I just did not know how to name it in english, I named it after my task I did it to use in my applicatin to manage tags.


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

## Load deafult values

Theer are 3 methods to load default values. Methods are listed in order it is executed. In all 3 methods format of values are the same.

Array example `["banana", "strawberry", "apple"]`. Or you can use objects or even mix like
`[{id: 1, text: "Apple", html: "This is <b>Apple</b>!"}, {id: 2, text: "Pear"}, "banana"]` where `html` is optional
key. In objects `id` is used to save, text to display in pill and `html` in typeahead suggestions.

1. First is to path default values as option.

        $('#bs-tags').tags({values:["banana", "apple"]});

2. Second to provide URL where through `GET` it will fetch default values

        $('#bs-tags').tags({values_url:"urls/defaults.json"});

3. And last is to use callback function

        $('#bs-tags').tags({
            onLoadDefaults:function(values){
                return $.merge(values,["apple", "banana"]);
            }
        });
    Here `values` contain already loaded values with previos methods.

Or you can use all methods at once. All values will be merged.
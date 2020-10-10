#create element list:(a float div to create)
-custom component
-button
-image
-label
-embed
-container
...

*These element apply for each single page thourgh api return HTML template
EX:
API: template_demo
 <div class="custom-template" key="Hello_World">
    <section id="page-title" class="full-height background-overlay v-center bg-loaded" data-bg-image="upload/image/home.jpg" style="background-image: url('upload/image/home.jpg');">
      <h3 field='{ "name" : "text", "type": "html" }'> Hello </h3>
    </section>
 </div>
<div id="demp">
*After that our plugin will constructor like this:
 $("#demo").contenteditor({
                    htmlUrl: 'data.json',
                   (data.json will api return layout that we want to show
                   EX: [{
                    "template": "Hello_World",
                    "fields": [{
                        "name": "text",
                        "type": "html",
                        "html": "xzczxc"
                    }]
                }]							 )
                    templatesUrl: our api "template_demo" return
                });

* the content tool edit for text will implement ckeditor inside(implement after core has built)

* Build a core for custom any class any attr

* More things will implement during working process

Our api will return like:
{
    id:'HomePage',
    data:{
        templateUrl:'http://a.com/demo.html',
        blockTemplate:[{
              "template": "Hello_World",
                    "fields": [{
                        "name": "text",
                        "type": "html",
                        "html": "xzczxc"
                    }]
        }]
    }
}





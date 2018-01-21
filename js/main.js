/* Main page dispatcher.
*/
const electron = require('electron')
const remote = electron.remote
const mainWindow = remote.getCurrentWindow()

requirejs(['app/index',
           'app/edit',
           'helper/colormap',
           'helper/util'],
function(indexPage, editPage, colormap, util) {
  var dataURL = "data/default.json",  // Change this to another dataset.
      params = util.getQueryParams();

  // Create a colormap for display. The following is an example.
  function createColormap(label, labels) {
    return (label) ?
      colormap.create("single", {
        size: labels.length,
        index: labels.indexOf(label)
      }) :
      [[255, 255, 255],
       [226, 196, 196],
       [64, 32, 32]].concat(colormap.create("hsv", {
        size: labels.length - 3
      }));
  }

  function getAnnotationURLs(directory, all_paths, add_path) {
    var path = path || require('path');
    return all_paths.map(function(this_path) {
      return path.join(path.dirname(directory), add_path, path.basename(directory), path.relative(directory, this_path));
    })
  }
  // Load dataset before rendering a view.
  function renderPage(renderer) {   
    util.requestJSON(dataURL, function(data) {
      data.imageURLs = mainWindow.file_list;
      data.annotationURLs = getAnnotationURLs(mainWindow.directory, mainWindow.file_list, 'annotated');
      data.colormap = createColormap(params.label, data.labels);
      params.width = data.size.width;
      params.height = data.size.height;
      renderer(data, params);
    });
  }

  switch(params.view) {
    case "index":
      renderPage(indexPage);
      break;
    case "edit":
      renderPage(editPage);
      break;
    default:
      params.view = "edit";
      params.id = 0;
      window.location = util.makeQueryParams(params);
      break;
  }
});

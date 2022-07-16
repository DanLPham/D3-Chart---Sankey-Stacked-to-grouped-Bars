export const createNodesData = (data) => {
  let nodes_data = [];
  let story_object = {
    "id": "Story " + data.id,
    "totalView": data.totalView,
  };
  nodes_data.push(Object.create(story_object));

  data.neighbors.map((neighbor) => {
    let story_object = {
      "id": "Story " + neighbor.id,
      "totalView": neighbor.totalView,
    };
    nodes_data.push(Object.create(story_object));
  });

  return nodes_data;
}

export const createLinksData = (data) => {
  let links_data = [];
  let focusedStoryTitle = data.title;

  data.neighbors.map((neighbor) => {
    let value = 0;

    for (let i = 0; i < neighbor.dailyContributingView.length; i++) {
      value += neighbor.dailyContributingView[i].view;
    }

    let link_object = {
      "source": neighbor.title,
      "target": focusedStoryTitle,
      "type": "contributing",
      "value": value,
    };

    links_data.push(Object.create(link_object));

    if (neighbor.id % 2 === 1) {
      let link_object = {
        "source": focusedStoryTitle,
        "target": neighbor.title,
        "type": "receiving",
        "value": value * 1.5,
      };

      links_data.push(Object.create(link_object));
    }
  });

  return links_data;
}

export const getxFromId = (id, xScale, maxWidthNode, width, focusedId) => {
  let new_id = id.split(' ').pop();
  if (new_id > width - maxWidthNode * 3) {
    new_id = width - maxWidthNode * 3;
  }
  let new_x = new_id - xScale(Math.floor(xScale.invert(width))) / 2 + maxWidthNode;
  if (id === focusedId) {
    new_x = xScale(Math.floor(xScale.invert(width))) / 2 - maxWidthNode;
  }
  return new_x;
}

export const convert2Epoch = (date) => {
  return date.getTime();
}
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

  story_object = {
    "id": "Other sources",
    "totalView": 3000000000,
  };
  nodes_data.push(Object.create(story_object));

  return nodes_data;
}

export const pushNewNodesData = (current_data_set, first_layer, new_data) => {
  new_data.neighbors.map((new_neighbor) => {
    let existing_flag = false;
    if (new_neighbor.id === first_layer.id) {
      existing_flag = true;
    } else {
      first_layer.neighbors.map((old_neighbor) => {
        if (old_neighbor.id === new_neighbor.id) {
          existing_flag = true;
        }
      });
    }

    if (existing_flag === false) {
      let story_object = {
        "id": "Story " + new_neighbor.id,
        "totalView": new_neighbor.totalView,
      };
      current_data_set.push(Object.create(story_object));
    }
  });

  return current_data_set;
}

export const createLinksData = (data, GKRdata, dateRange) => {
  let links_data = [];
  let focusedStoryTitle = data.title;

  data.neighbors.map((neighbor, idx) => {
    let value = 0;

    for (let i = 0; i < neighbor.dailyContributingView.length; i++) {
      let contributing_date = new Date(neighbor.dailyContributingView[i].date);
      if (contributing_date >= dateRange[0] && contributing_date <= dateRange[1]) {
        value += neighbor.dailyContributingView[i].view;
      }
    }

    let link_object = {
      "source": neighbor.title,
      "target": focusedStoryTitle,
      "type": "receiving",
      "value": value,
    };

    links_data.push(Object.create(link_object));

    link_object = {
      "source": focusedStoryTitle,
      "target": neighbor.title,
      "type": "GKRsimilarity",
      "value": GKRdata[idx] * 5000,
    };

    links_data.push(Object.create(link_object));

    if (neighbor.id % 2 === 1) {
      link_object = {
        "source": focusedStoryTitle,
        "target": neighbor.title,
        "type": "contributing",
        "value": value * 1.5,
      };

      links_data.push(Object.create(link_object));
    }
  });

  let link_object = {
    "source": "Other sources",
    "target": focusedStoryTitle,
    "type": "receiving",
    "value": 20000000,
  };

  links_data.push(Object.create(link_object));

  return links_data;
}

export const pushNewLinksData = (current_data_set, first_layer, GKRdata, new_data, dateRange) => {
  let focusedNeighborStoryTitle = new_data.title;
  let focusedStoryTitle = first_layer.title;

  new_data.neighbors.map((neighbor_2nd, idx) => {
    let value = 0;

    if (neighbor_2nd.title !== focusedStoryTitle) {
      for (let i = 0; i < neighbor_2nd.dailyContributingView.length; i++) {
        let contributing_date = new Date(neighbor_2nd.dailyContributingView[i].date);
        if (contributing_date >= dateRange[0] && contributing_date <= dateRange[1]) {
          value += neighbor_2nd.dailyContributingView[i].view;
        }
      }

      let link_object = {
        "source": neighbor_2nd.title,
        "target": focusedNeighborStoryTitle,
        "type": "2ndlink",
        "value": value,
      };

      current_data_set.push(Object.create(link_object));

      link_object = {
        "source": focusedNeighborStoryTitle,
        "target": neighbor_2nd.title,
        "type": "GKRsimilarity",
        "value": GKRdata[idx] * 5000,
      };

      current_data_set.push(Object.create(link_object));

      if (neighbor_2nd.id % 2 === 1) {
        link_object = {
          "source": focusedNeighborStoryTitle,
          "target": neighbor_2nd.title,
          "type": "2ndlink",
          "value": value * 1.5,
        };

        current_data_set.push(Object.create(link_object));
      }
    }
  });

  return current_data_set;
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

export const getIdNumberFromId = (id) => {
  let new_id = id.split(' ').pop();
  return new_id;
}
// const categoryIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 27];
const categoryIds = [1];

const mi_category = function() {
  let data = {};

  for (let i = 0; i < categoryIds.length; i++) {
    data[`category_${categoryIds[i]}`] = {
      id: categoryIds[i],
      data: []
    }
  }

  return data
  
}

module.exports = mi_category
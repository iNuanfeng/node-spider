const mi_category = function(categoryIds) {
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
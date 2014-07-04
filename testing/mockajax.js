/** @module testing/mockajax */

define(['mock'], function(Mock) {

  Mock.mockPost = function(data) {
    var mockPost = Mock.mockFunction('post');
    var mockDone = Mock.mockFunction('done');
    Mock.when(mockPost).doReturn({done: mockDone});
    return {post: mockPost, done: mockDone};
  };

  return Mock;
});
(function () {
  'use strict';

  describe('input validation', function () {
    var elem;

    beforeEach(function(){
      elem = $('<input>');
    });

    afterEach(function() {
      expect(elem.val).toHaveBeenCalled();
    });

    it('passes given a String', function(){
      spyOn(elem, 'val').and.returnValue('input');
      expect(validate(elem)).toBe(true);
    });

    it('fails given empty string', function(){
      spyOn(elem, 'val').and.returnValue('');
      expect(validate(elem)).toBe(false);
    });

    it('fails given null', function(){
      spyOn(elem, 'val').and.returnValue(null);
      expect(validate(elem)).toBe(false);
    });

    it('fails given undefined', function(){
      spyOn(elem, 'val').and.returnValue(undefined);
      expect(validate(elem)).toBe(false);
    });
  });
})();

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

library AddressSet {
    struct Storage {
        mapping (address => bool) _exists;
        address[] _items;
    }
    function add(Storage storage arr, address item) public  {
        if (!arr._exists[item]) {
            arr._items.push(item);
            arr._exists[item] = true;
        }
    }
    function exists(Storage storage arr, address item) public view returns (bool) {
        return arr._exists[item];
    }
    function length(Storage storage arr) public view returns (uint256) {
        return arr._items.length;
    }
    function items(Storage storage arr, uint256 _offset, uint256 _limit) public view returns (address[] memory) {
        if (_limit == 0) return arr._items;
        uint256 iEnd = _offset + _limit;
        if (iEnd > arr._items.length) {
            iEnd = arr._items.length;
        }
        address[] memory ret = new address[](iEnd - _offset);
        for (uint256 i = 0; i < iEnd - _offset ; i++) {
            ret[i] = arr._items[
                arr._items.length - i - _offset - 1
            ];
        }
        return ret;
    }
    function get(Storage storage arr, uint256 index) public view returns (address ret) {
        if (index < arr._items.length) {
            return arr._items[index];
        }
    }
    function del(Storage storage arr, address item) public  {
        if (arr._exists[item]) {
            arr._exists[item] = false;
            if (arr._items.length == 1 || (arr._items[arr._items.length-1] == item)) {
                arr._items.pop();
                return;
            }
            for(uint256 i = 0; i < arr._items.length; i++) {
                if (arr._items[i] == item) {
                    arr._items[i] = arr._items[arr._items.length -1];
                    arr._items.pop();
                    return;
                }
            }
        }
    }
}
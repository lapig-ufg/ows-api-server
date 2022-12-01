## Classes

<dl>
<dt><a href="#CacheBuilder">CacheBuilder</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#getCacheRequests">getCacheRequests</a> ⇒ <code>array</code></dt>
<dd></dd>
</dl>

<a name="CacheBuilder"></a>

## CacheBuilder
**Kind**: global class  
<a name="new_CacheBuilder_new"></a>

### new CacheBuilder(regions, layerType, typeCache)
**Throws**:

- Will throw an error if the arguments is null, undefined or empty.


| Param | Type | Description |
| --- | --- | --- |
| regions | <code>object</code> | Object that contains the collections of biomes, ufs and municipalities. |
| layerType | <code>object</code> | Object that describes the layer of descriptor. |
| typeCache | <code>string</code> | Type of cache requests ex. tiles or downloads. |

<a name="getCacheRequests"></a>

## getCacheRequests ⇒ <code>array</code>
**Kind**: global variable  
**Returns**: <code>array</code> - An collection with all requests of cache.  

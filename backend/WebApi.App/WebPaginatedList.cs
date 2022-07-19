using System.Linq;
using System.Collections.Generic;
using AutoMapper;
using Database.Lib;

namespace WebApi.App;
public class WebPaginatedList<T>
{
    public int PageIndex { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage => PageIndex > 1;
    public bool HasNextPage => PageIndex < TotalPages;

    public List<T> Items { get; set; } = new List<T>();

    public WebPaginatedList(IEnumerable<T> items, int pageIndex, int totalPages)
    {
        Items.AddRange(items);
        PageIndex = pageIndex;
        TotalPages = totalPages;
    }

    public static WebPaginatedList<T> CreateFrom<TSource>(PaginatedList<TSource> source, IMapper mapper)
    {
        return new WebPaginatedList<T>(source.Select(x => mapper.Map<TSource, T>(x)), source.PageIndex, source.TotalPages);
    }
}
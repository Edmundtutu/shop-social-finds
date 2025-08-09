<?php
namespace App\Http\Filters;

use Illuminate\Http\Request;

class ApiFilter {
    protected $allowed_params = [];
    protected $column_map = [];
    protected $operator_map =[
        'eq' => '=',
        'lt' => '<',
        'lte' => '<=',
        'gt' => '>',
        'gte' => '>=',
        'ne' => '!=',
        'in' => 'IN',
        'not_in' => 'NOT IN',
        'btw' => 'BETWEEN',
        'not_btw' => 'NOT BETWEEN',
        'like'=>'LIKE',
    ];

    public function transform(Request $request){
        $eloquent_query = [];
        foreach($this->allowed_params as $param => $operators){
            $query = $request->query($param);

            if(!isset($query)){
                continue;
            }

            $column = $this->column_map[$param] ?? $param;

            foreach($operators as $operator){
                if(isset($query[$operator])){
                    $eloquent_query[] = [$column, $this->operator_map[$operator], $query[$operator]];
                }
            }
            
        }
        return $eloquent_query;
    }
}
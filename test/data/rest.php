<?php
header("Content-Type: application/json");
$total = 500;
$id_prefix = "";
if(isset($_GET["parent"])){
	$id_prefix = ($_GET["parent"] + 1) * 1000;
}
usleep(rand(0,500000));
$range = "";
if(isset($_GET["range"])){
	$range = $_GET["range"];
}
if($range){
	preg_match('/(\d+)-(\d+)/', $range, $matches);
	
	$start = $matches[1];
	$end = $matches[2];
	if($end > $total){
		$end = $total;
	}
}else{
	$start = 0;
	$end = 40;
}
header('Content-Range: ' . 'items '.$start.'-'.($end-1).'/'.$total);
echo '[';
for ($i = $start; $i < $end; $i++) {
	if($i != $start){
		echo ',';
	}
    echo '{"id":'.($id_prefix+$i).',"name":"Item '.$i.'","comment":"hello"}';
}
echo ']';
?>

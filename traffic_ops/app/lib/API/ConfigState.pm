package API::ConfigState;

# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
# 
#   http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.


use UI::Utils;
use Mojo::Base 'Mojolicious::Controller';
use Data::Dumper;
use JSON;
use MojoPlugins::Response;

sub show {
	my $self = shift;
	if ( !&is_oper($self) ) {
		return $self->forbidden();
	}

	my $queue_update_label_prefix = $self->db->resultset("Parameter")->search( { config_file => 'global', name => 'queue_update_label_prefix' } )
		->get_column('value')->single();
	my $queue_update_time = $self->db->resultset("Parameter")->search( { config_file => 'global', name => 'queue_update_time' } )
		->get_column('value')->single();
	my $queue_update_label_string = $queue_update_label_prefix.":".$queue_update_time;

	my @tables = ( "Deliveryservice", "DeliveryserviceServer");
	my @db_state;
	#DB label will not be unique i using only "last update time" as row may be deleted with no effect on this field
	#Hash of the entire table may be better but expensive
	my $naive_db_state_label = "";
	my $table;
	foreach $table (@tables) {
		my $row_last_updated = $self->db->resultset($table)->search( undef )->get_column('last_updated')->max();
		my $rows_count = $self->db->resultset($table)->search()->count();
		if ( $row_last_updated gt $naive_db_state_label ) {
			$naive_db_state_label = $row_last_updated;
		}
		push(
			@db_state, {
				"Table"          => $table,
				"RowLastUpdated" => $row_last_updated,
				"RowsCount"      => $rows_count
			}
		);
	}
	$naive_db_state_label = substr($naive_db_state_label, 0, index($naive_db_state_label, '.'));
	$naive_db_state_label =~ s/-//g;
	$naive_db_state_label =~ s/://g;
	$naive_db_state_label =~ s/ /-/;


	my @config_state = ();
	push(@config_state, {
			"FormatVersion" => 1,
			"QueueUpdate"   => {
				"Label" => $queue_update_label_string,
				"Info"  => {
					"Prefix" => $queue_update_label_prefix,
					"Time"   => $queue_update_time
				}
			},
			"DbState"       => {
				"Label" => $naive_db_state_label,
				"Info"       => \@db_state

			}
		}
	);
	$self->success( \@config_state );
}


1;

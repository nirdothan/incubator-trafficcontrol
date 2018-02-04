package API::DeliveryService::MspTemplate;
#
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
#
#

use Mojo::Base 'Mojolicious::Controller';
use UI::Utils;
use Data::Dumper;
use LWP::UserAgent;
use JSON;

sub dump {
    my $self = shift;

    my $template_url = $self->db->resultset("Parameter")->search( { config_file => 'global', name => 'signature.templates.url' } )
        ->get_column('value')->single();


    my $ua = LWP::UserAgent->new;

    my $server_endpoint = $template_url;

    # set custom HTTP request header fields
    my $req = HTTP::Request->new(GET => $server_endpoint);
    $req->header('content-type' => 'application/json');
    $req->header('x-auth-token' => 'kfksj48sdfj4jd9d');

    my $resp = $ua->request($req);
    if ($resp->is_success) {
        $self->success(decode_json($resp->content));
    }
    else {
        $self->alert("Failed: ".$resp->message.", code:".$resp->code);
    }

}

1;
